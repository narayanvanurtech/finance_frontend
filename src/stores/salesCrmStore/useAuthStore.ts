//src/stores/useAuthStore.ts

import { create } from "zustand";
import Cookies from "js-cookie";
import { login, logout, generateNewTokens } from "@/api/authApi";

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  isActive: boolean;
  deviceTokens: string[];
  subscription: {
    _id: string;
    plan: {
      _id: string;
      name: string;
      description: string;
      price: number;
      billingCycle: string;
      isActive: boolean;
      isFree: boolean;
      trialDays: number;
      features: {
        meeting: boolean;
        task: boolean;
        deal: boolean;
        reporting: boolean;
        analytics: boolean;
        lead: boolean;
        call: boolean;
        maxUsers: number;
        storage: number;
      };
      createdAt: string;
      updatedAt: string;
    };
    startDate: string;
    endDate: string;
    trialEndDate: string;
    status: string;
    paymentStatus: string;
    billingCycle: string;
  } | null;
  billingCycle: string;
  companyId: string;
}

interface RegisteredUser {
  _id: string;
  email: string;
  name: string;
  mobile: string;
  role: string;
  tempTokens: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  registeredUser: RegisteredUser | null;
  isRegistrationComplete: boolean;
  isCompanySetupComplete: boolean;
}

interface AuthActions {
  loginUser: (
    email: string,
    password: string,
    deviceToken: string
  ) => Promise<void>;
  logoutUser: (fcmToken?: string) => Promise<void>;
  refreshTokens: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setRegisteredUser: (user: RegisteredUser) => void;
  setRegistrationComplete: (complete: boolean) => void;
  setCompanySetupComplete: (complete: boolean) => void;
  clearRegistrationData: () => void;
  updateUserSubscription: (subscriptionData: any) => void;
}

type AuthStore = AuthState & AuthActions;

// Cookie options
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

// Initialize state from cookies
const getInitialState = (): AuthState => ({
  token: Cookies.get("token") || null,
  refreshToken: Cookies.get("refreshToken") || null,
  isAuthenticated: !!Cookies.get("token"),
  user: Cookies.get("user") ? JSON.parse(Cookies.get("user")!) : null,
  registeredUser: Cookies.get("registeredUser") ? JSON.parse(Cookies.get("registeredUser")!) : null,
  isRegistrationComplete: !!Cookies.get("isRegistrationComplete"),
  isCompanySetupComplete: !!Cookies.get("isCompanySetupComplete"),
});

export const useAuthStore = create<AuthStore>()((set) => ({
  ...getInitialState(),

  setTokens: (accessToken: string, refreshToken: string) => {
    Cookies.set("token", accessToken, COOKIE_OPTIONS);
    Cookies.set("refreshToken", refreshToken, COOKIE_OPTIONS);
    set({ token: accessToken, refreshToken, isAuthenticated: true });
  },

  loginUser: async (email, password, deviceToken) => {
    const response = await login(email, password, deviceToken);
    if (!response.success) {
      throw new Error(response.message || "Login failed");
    }
    const { user: userData, subscription } = response.result;
    const userObj = {
      ...userData,
      subscription: subscription
        ? {
            _id: subscription._id,
            plan: {
              _id: typeof subscription.plan === "string"
                ? subscription.plan
                : (subscription.plan as { _id: string })?._id || "",
              name: "",
              description: "",
              price: 0,
              billingCycle: subscription.billingCycle || "",
              isActive: true,
              isFree: false,
              trialDays: 0,
              features: {
                meeting: false,
                task: false,
                deal: false,
                reporting: false,
                analytics: false,
                lead: false,
                call: false,
                maxUsers: 0,
                storage: 0,
              },
              createdAt: "",
              updatedAt: "",
            },
            startDate: subscription.startedAt || "",
            endDate: subscription.expiresAt || "",
            trialEndDate: "",
            status: subscription.subscriptionStatus || "",
            paymentStatus: subscription.paymentStatus || "",
            billingCycle: subscription.billingCycle || "",
          }
        : null,
      billingCycle: subscription?.billingCycle || "",
      companyId: userData.company || "",
    };
    set({
      token: userData.tokens,
      refreshToken: userData.refreshTokens,
      isAuthenticated: true,
      user: userObj,
    });
    Cookies.set("token", userData.tokens, COOKIE_OPTIONS);
    Cookies.set("refreshToken", userData.refreshTokens, COOKIE_OPTIONS);
    Cookies.set("user", JSON.stringify(userObj), COOKIE_OPTIONS);
    //console.log(userObj);
  },

  logoutUser: async (deviceToken?: string) => {
    const currentUser = Cookies.get("user")
      ? JSON.parse(Cookies.get("user")!)
      : null;

    if (!currentUser?._id) {
      throw new Error("User not found");
    }

    try {
      await logout(
        currentUser._id,
        deviceToken || currentUser.deviceTokens[0] || ""
      );
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API fails
    }

    // Remove cookies
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    Cookies.remove("user");

    set({
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      user: null,
    });
  },

  refreshTokens: async () => {
    try {
      const currentRefreshToken = Cookies.get("refreshToken");

      if (!currentRefreshToken) {
        await useAuthStore.getState().logoutUser();
        return;
      }

      const response = await generateNewTokens(currentRefreshToken);

      if (!response || !response.tokens || !response.refreshTokens) {
        await useAuthStore.getState().logoutUser();
        return;
      }

      const { tokens, refreshTokens } = response;

      // Update cookies with new tokens
      Cookies.set('token', tokens, COOKIE_OPTIONS);
      Cookies.set('refreshToken', refreshTokens, COOKIE_OPTIONS);
      
      // Update store state
      set({
        token: tokens,
        refreshToken: refreshTokens,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Token refresh failed:", error);
      await useAuthStore.getState().logoutUser();
    }
  },

  setRegisteredUser: (user: RegisteredUser) => {
    Cookies.set("registeredUser", JSON.stringify(user), COOKIE_OPTIONS);
    Cookies.set("isRegistrationComplete", "true", COOKIE_OPTIONS);
    set({ registeredUser: user, isRegistrationComplete: true });
  },

  setRegistrationComplete: (complete: boolean) => {
    Cookies.set("isRegistrationComplete", complete.toString(), COOKIE_OPTIONS);
    set({ isRegistrationComplete: complete });
  },

  setCompanySetupComplete: (complete: boolean) => {
    Cookies.set("isCompanySetupComplete", complete.toString(), COOKIE_OPTIONS);
    set({ isCompanySetupComplete: complete });
  },

  clearRegistrationData: () => {
    Cookies.remove("registeredUser");
    Cookies.remove("isRegistrationComplete");
    Cookies.remove("isCompanySetupComplete");
    set({ 
      registeredUser: null, 
      isRegistrationComplete: false, 
      isCompanySetupComplete: false 
    });
  },

  updateUserSubscription: (subscriptionData: any) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      subscription: {
        _id: subscriptionData._id,
        plan: {
          _id: subscriptionData.plan,
          name: "",
          description: "",
          price: subscriptionData.price,
          billingCycle: subscriptionData.billingCycle || "",
          isActive: true,
          isFree: subscriptionData.price === 0,
          trialDays: 0,
          features: {
            meeting: false,
            task: false,
            deal: false,
            reporting: false,
            analytics: false,
            lead: false,
            call: false,
            maxUsers: 0,
            storage: 0,
          },
          createdAt: subscriptionData.createdAt,
          updatedAt: subscriptionData.updatedAt,
        },
        startDate: subscriptionData.startedAt,
        endDate: subscriptionData.expiresAt,
        trialEndDate: "",
        status: subscriptionData.subscriptionStatus,
        paymentStatus: subscriptionData.paymentStatus,
        billingCycle: subscriptionData.billingCycle,
      },
      billingCycle: subscriptionData.billingCycle,
    };

    // Update cookies and state
    Cookies.set("user", JSON.stringify(updatedUser), COOKIE_OPTIONS);
    set({ user: updatedUser });
  },
}));
