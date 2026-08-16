import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { mockUsers } from "../services/mockData";
import { AuthState, LoginCredentials, SignupCredentials, User } from "../types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      const userJson = await AsyncStorage.getItem("user_data");

      if (token && userJson) {
        const user = JSON.parse(userJson);
        setState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      // Mock authentication
      const user = mockUsers.find(
        (u) => u.email === credentials.email,
        // In real app, would check password too
      );

      if (!user) {
        throw new Error("Invalid credentials");
      }

      const token = "mock_jwt_token_" + Date.now();

      // Store auth data
      await AsyncStorage.setItem("auth_token", token);
      await AsyncStorage.setItem("user_data", JSON.stringify(user));

      setState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      // Mock signup
      const existingUser = mockUsers.find((u) => u.email === credentials.email);
      if (existingUser) {
        throw new Error("User already exists");
      }

      const newUser: User = {
        id: "u" + (mockUsers.length + 1),
        name: credentials.name,
        email: credentials.email,
        phone: credentials.phone,
        role: credentials.role,
        avatar: `https://i.pravatar.cc/150?img=${mockUsers.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // In real app, would save to backend
      mockUsers.push(newUser);

      const token = "mock_jwt_token_" + Date.now();

      await AsyncStorage.setItem("auth_token", token);
      await AsyncStorage.setItem("user_data", JSON.stringify(newUser));

      setState({
        user: newUser,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("user_data");
      setState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const updateUser = (user: User) => {
    setState((prev) => ({ ...prev, user }));
    AsyncStorage.setItem("user_data", JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, signup, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
