"use client";
import axios from "axios";
import z from "zod";
import { setCookie } from "cookies-next/client";
import { redirect } from "next/navigation";
// import { AuthResponse } from "../model/schemas/auth-response";
// import 

interface SignUpData {
  email: string;
  password: string;
  name: string;
  country: string;
  avatar?: File;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    aud: string;
    role?: string;
    username?: string;
  };
  session?: {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
  };
}

const AuthResponseError = z.object({
  error: z.string(),
});

async function countryFromCoords(
  coords: GeolocationCoordinates,
): Promise<string> {
  const { latitude, longitude } = coords;
  const response = await axios.get(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
  );
  const country = response.data.address.country_code;
  return country;
}

async function getCountryCode(): Promise<string> {
  if (typeof window === "undefined") {
    return "";
  }

  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const country = await countryFromCoords(position.coords);
            resolve(country);
          } catch (error) {
            console.error("Error getting country from coords:", error);
            resolve("");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          resolve("");
        },
      );
    } else {
      resolve("");
    }
  });
}

export async function signUp(incomingData: SignUpData): Promise<AuthResponse> {
  const country = await getCountryCode();
  const data = { ...incomingData, country };

  try {
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("name", data.name);
    formData.append("country", data.country);

    if (data.avatar) {
      formData.append("file", data.avatar);
    }

    // First make the external signup request
    const externalResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/signup`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
        },
        withCredentials: false // Remove credentials for external request
      },
    );

    if (externalResponse.status !== 200) {
      const resError = AuthResponseError.parse(externalResponse.data);
      throw new Error(resError.error);
    }

    // Then set up local session through our API
    const localResponse = await axios.post(
      `/api/auth/signup`,
      { 
        externalAuth: {
          session: {
            access_token: externalResponse.data.session.access_token,
            expires_in: externalResponse.data.session.expires_in,
            refresh_token: externalResponse.data.session.refresh_token
          },
          user: externalResponse.data.user
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true // Keep credentials for local request
      }
    );

    if (localResponse.status !== 200) {
      throw new Error('Failed to create local session');
    }

    return localResponse.data;
  } catch (error: unknown) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(`Đăng ký thất bại: ${errorMessage}`);
    }
    throw new Error('Đăng ký thất bại, vui lòng thử lại sau');
  }
}

export async function login(data: LoginData): Promise<AuthResponse> {
  try {
    console.log('Attempting external authentication...');
    // First authenticate with external server
    const externalResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/signin`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: false
      }
    );

    console.log('External auth response:', externalResponse.data);

    if (!externalResponse.data?.session?.access_token) {
      throw new Error('Invalid response from authentication server');
    }

    console.log('Setting up local session...');
    // Then set up local session through our API
    const localResponse = await axios.post(
      `/api/auth/signin`,
      { 
        externalAuth: {
          session: {
            access_token: externalResponse.data.session.access_token,
            expires_in: externalResponse.data.session.expires_in,
            refresh_token: externalResponse.data.session.refresh_token
          },
          user: externalResponse.data.user
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true
      }
    );

    if (!localResponse.data.success) {
      throw new Error('Failed to create local session');
    }

    return localResponse.data;
  } catch (error: unknown) {
    console.error('Login error details:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(errorMessage);
    }
    
    throw new Error('Đăng nhập thất bại, vui lòng thử lại sau');
  }
}

export async function verifyEmail(token: string): Promise<void> {
  try {
    const response = await axios.post(
      `${process.env.API_URL}/v1/auth/verify-email`,
      { token },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.status !== 200) {
      throw new Error("Email verification failed");
    }
  } catch (error) {
    console.error(error);
    throw new Error("Email verification failed");
  }
}

export function redirectToLogin(returnUrl?: string) {
  //validate returnUrl
  if (returnUrl && !returnUrl.startsWith("/")) {
    returnUrl = "/";
  }
  // create full return url
  const loginPath = returnUrl
    ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
    : "/login";

  if (typeof window === "undefined") {
    redirect(loginPath);
  } else {
    window.location.href = loginPath;
  }
}

let authListeners: ((isAuthenticated: boolean) => void)[] = [];

export const addAuthListener = (
  listener: (isAuthenticated: boolean) => void,
) => {
  authListeners.push(listener);
};

export const removeAuthListener = (
  listener: (isAuthenticated: boolean) => void,
) => {
  authListeners = authListeners.filter((l) => l !== listener);
};

export const notifyAuthChange = (isAuthenticated: boolean) => {
  authListeners.forEach((listener) => listener(isAuthenticated));
};

export const logout = async () => {
  try {
    // Call logout endpoint to clear server-side session
    await axios.post('/api/auth/logout', {}, { 
      withCredentials: true 
    });
    
    // Notify listeners of auth change
    notifyAuthChange(false);

    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    } else {
      redirect("/login");
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export async function signInWithGoogle(returnUrl?: string) {
  console.log("signInWithGoogle", returnUrl);
  try {
    const callbackUrl = returnUrl
      ? `?returnUrl=${encodeURIComponent(returnUrl)}`
      : "/";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is not configured");
    }
    const response = await axios.get(`${apiUrl}/v1/auth/oauth${callbackUrl}`);
    if (response.status !== 200) {
      throw new Error("Authentication failed");
    }
    window.location.href = response.data.url;
  } catch (error) {
    console.error("Google sign in error:", error);
    throw new Error(
      "Unable to initiate Google sign in. Please try again later.",
    );
  }
}

export const handleAuthCallback = async (data: AuthResponse): Promise<void> => {
  try {
    if (!data.session?.access_token) {
      throw new Error("No access token received");
    }

    const cookieOptions = {
      maxAge: data.session.expires_in || 3600,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
    };

    // Set auth cookies
    setCookie("access_token", data.session.access_token, cookieOptions);

    if (data.session.refresh_token) {
      setCookie("refresh_token", data.session.refresh_token, cookieOptions);
    }

    // Set user info cookies
    if (data.user.username) {
      setCookie("user_name", data.user.username, cookieOptions);
    }

    setCookie("user_id", data.user.id, cookieOptions);

    // Store minimal user info in localStorage
    const userInfo = {
      id: data.user.id,
      username: data.user.username,
    };
    localStorage.setItem("user", JSON.stringify(userInfo));

    notifyAuthChange(true);
  } catch (error) {
    console.error("Auth callback error:", error);
    throw new Error("Failed to process authentication callback");
  }
};

export async function verifyAuth(token: string): Promise<AuthResponse> {
  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/v1/user/`, { token }, {
    
  });
  return response.data;
}
// const signInWithGoogle: RequestHandler = async (
//   req: Request,
//   res: Response,
// ) => {
//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider: "google",
//     options: {
//       redirectTo: ${env.BASE_URL.replace(/\*/g, "open")}/v1/auth/oauth/callback,
//     },
//   });

//   if (error) {
//     res.status(error.status ?? 500).json({ error: error.message });
//     return;
//   }

//   if (!data.url) {
//     res.status(500).json({ error: "Failed to fetch oauth url" });
//     return;
//   }

//   res.status(200).json({ url: data.url });
// };

// const handleOAuthCallback: RequestHandler = async (
//   req: Request,
//   res: Response,
// ) => {
//   const baseUrl = env.BASE_URL.replace(/\*/g, "open");
//   const callbackAddr = new URL("/api/auth/callback", baseUrl).toString();
//   const redirectAddr = new URL("/login", baseUrl).toString();

//   const { code } = req.query;

//   if (!code) {
//     const codeErrorParams = new URLSearchParams({
//       error: "code missing",
//     });
//     return res.status(400).redirect(${redirectAddr}?${codeErrorParams});
//   }

//   const { data: tokenData, error: tokenError } =
//     await supabase.auth.exchangeCodeForSession(code as string);

//   if (tokenError) {
//     const tokenErrorParams = new URLSearchParams({
//       error: "token exchange failed",
//     });
//     return res.status(500).redirect(${redirectAddr}?${tokenErrorParams});
//   }

//   const { access_token, refresh_token, expires_in, user } = tokenData.session;

//   const {
//     data: userData,
//     error: userError,
//     status,
//   } = await supabasePro
//     .from("profiles")
//     .select("username, role")
//     .eq("id", user.id)
//     .single();

//   if (userError) {
//     const userErrorParams = new URLSearchParams({
//       error: "user fetch failed",
//     });
//     return res
//       .status(status ?? 500)
//       .redirect(${redirectAddr}?${userErrorParams});
//   }

//   try {
//     await fetch(callbackAddr, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         user: {
//           id: user.id,
//           aud: user.aud,
//           username: userData.username,
//           role: userData.role,
//         },
//         session: {
//           access_token,
//           expires_in,
//           refresh_token,
//         },
//       }),
//     });

//     return res.redirect(redirectAddr);
//   } catch (error) {
//     console.error(error);
//     const unknownErrorParams = new URLSearchParams({
//       error: "unhandled fetch exception",
//     });
//     return res.status(500).redirect(${redirectAddr}?${unknownErrorParams});
//   }
// };