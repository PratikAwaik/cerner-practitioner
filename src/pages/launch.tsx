import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getLSValue, setLSValue } from "../utils/local-storage";
import pkceChallenge from "pkce-challenge";
import { deleteCookie, getCookie, setCookie } from "../utils/cookie-storage";
import {
  CLIENT_ID,
  COOKIE_KEYS,
  LOCALSTORAGE_KEYS,
  REDIRECT_URI,
} from "../utils/constants";
import { createRandomString, secondsToDays } from "../utils/helpers";
import toast from "react-hot-toast";
import { Token } from "../types";
import { Spinner } from "@/components/ui/spinner";

export default function LaunchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const issParam = searchParams.get("iss");
  const launchParam = searchParams.get("launch");
  const codeParam = searchParams.get("code");
  const stateParam = searchParams.get("state");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const generateAndSetPkceChallenge = async () => {
    const pkce = await pkceChallenge();
    setCookie(COOKIE_KEYS.CODE_VERIFIER, pkce.code_verifier);
    return pkce;
  };

  const isStateSame = useCallback((searchParamState: string) => {
    const cookieState = getCookie(COOKIE_KEYS.STATE);
    return cookieState === searchParamState;
  }, []);

  const getWellknownConfiguration = useCallback(async (iss: string) => {
    const lsWellknown = getLSValue(iss);
    if (lsWellknown) {
      setLSValue(LOCALSTORAGE_KEYS.CURRENT_ISS, iss);
      return lsWellknown;
    }

    const response = await axios.get(`${iss}/.well-known/smart-configuration`);
    setLSValue(iss, response.data);
    setLSValue(LOCALSTORAGE_KEYS.CURRENT_ISS, iss);
    return response.data;
  }, []);

  const constructAuthorizeUrl = useCallback(
    async (endpoint: string, iss: string, launch: string) => {
      const pkce = await generateAndSetPkceChallenge();
      const state = createRandomString();
      setCookie(COOKIE_KEYS.STATE, state);

      const authUrl = new URL(endpoint);
      authUrl.searchParams.set("client_id", CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.set(
        "scope",
        "openid fhirUser launch user/Observation.read user/Observation.write user/Patient.read"
      );
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("launch", launch);
      authUrl.searchParams.set("aud", iss);
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("code_challenge", pkce.code_challenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
      return authUrl.href;
    },
    []
  );

  const initiateOAuth = useCallback(
    async (iss: string, launch: string) => {
      const wellKnown = await getWellknownConfiguration(iss);
      const authorizeEndpoint = wellKnown?.authorization_endpoint;
      const authUrl = await constructAuthorizeUrl(
        authorizeEndpoint,
        iss,
        launch
      );
      window.location.href = authUrl;
    },
    [getWellknownConfiguration, constructAuthorizeUrl]
  );

  const getToken = useCallback(async (code: string) => {
    const codeVerifier = getCookie(COOKIE_KEYS.CODE_VERIFIER);
    const iss = getLSValue(LOCALSTORAGE_KEYS.CURRENT_ISS);
    const tokenUrl = getLSValue(iss)?.token_endpoint as string;

    const response = await axios.post(
      tokenUrl,
      {
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data;
  }, []);

  useEffect(() => {
    if (!issParam || !launchParam) {
      setError("ISS or Launch Parameters not found!");
    }

    if (issParam && launchParam) {
      initiateOAuth(issParam, launchParam);
      return;
    }

    if (codeParam) {
      if (stateParam && isStateSame(stateParam)) {
        setLoading(true);
        getToken(codeParam)
          .then((response: Token) => {
            const expires = secondsToDays(response.expires_in);
            setCookie(COOKIE_KEYS.ACCESS_TOKEN, response.access_token, {
              expires,
            });
            setLSValue(
              LOCALSTORAGE_KEYS.NEED_PATIENT_BANNER,
              response.need_patient_banner
            );
            deleteCookie(COOKIE_KEYS.CODE_VERIFIER);
            deleteCookie(COOKIE_KEYS.STATE);
            toast.success("Successfully signed in.");
            navigate("/");
          })
          .catch((err) => {
            console.error(err);
            toast.error("Something went wrong. Please try again!");
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        toast.error(
          "Your code has been compromised. Please restart the launch process!"
        );
      }
    }
  }, [
    issParam,
    launchParam,
    codeParam,
    stateParam,
    initiateOAuth,
    isStateSame,
    getToken,
    navigate,
  ]);

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-3xl font-semibold">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="items-center justify-center w-full h-full">
        <Spinner />
      </div>
    );
  }

  return <div>Launch</div>;
}
