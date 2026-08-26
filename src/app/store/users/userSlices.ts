// store/users/usersSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AuthState,
  CustomerProfile,
  LoginCredentials,
  RegisterCredentials,
  UpdateCustomerDto,
  UpdateProfileDto,
  UpdateWorkerDto,
  User,
  WorkerProfile,
} from "./user.types";

// Mock user data
const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "Kasun Perera",
    email: "kasun@example.com",
    phone: "+94771234567",
    avatar: "https://i.pravatar.cc/300?img=12",
    role: "worker",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    isVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "user-2",
    name: "Nimal Fernando",
    email: "nimal@example.com",
    phone: "+94772345678",
    avatar: "https://i.pravatar.cc/300?img=13",
    role: "worker",
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    isVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
  {
    id: "user-customer-1",
    name: "Priyanka Silva",
    email: "priyanka@example.com",
    phone: "+94773456789",
    avatar: "https://i.pravatar.cc/300?img=20",
    role: "customer",
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    isVerified: true,
    emailVerified: true,
    phoneVerified: true,
  },
];

// Mock customer profile
const MOCK_CUSTOMER_PROFILE: CustomerProfile = {
  id: "customer-1",
  userId: "user-customer-1",
  user: MOCK_USERS[2],
  address: {
    street: "123 Main Street",
    city: "Colombo",
    district: "Colombo",
    coordinates: {
      lat: 6.9271,
      lng: 79.8612,
    },
  },
  preferences: {
    categories: ["plumbing", "electrical", "cleaning"],
    notifications: true,
    language: "en",
  },
  totalJobsPosted: 15,
  totalSpent: 250000,
  averageRating: 4.8,
};

// Mock worker profile
const MOCK_WORKER_PROFILE: WorkerProfile = {
  id: "worker-1",
  userId: "user-1",
  user: MOCK_USERS[0],
  profession: "Plumber",
  category: "plumbing",
  rating: 4.9,
  totalJobs: 128,
  verified: true,
  location: {
    district: "Colombo",
    city: "Nugegoda",
    address: "45 Lake Road, Nugegoda",
    coordinates: {
      lat: 6.8707,
      lng: 79.8856,
    },
  },
  services: [
    {
      id: "s1",
      name: "Pipe Repair",
      description: "Fixing leaking pipes and plumbing issues",
      price: 1500,
      duration: "1-2 hours",
    },
    {
      id: "s2",
      name: "Bathroom Plumbing",
      description: "Complete bathroom plumbing installation and repair",
      price: 5000,
      duration: "4-6 hours",
    },
    {
      id: "s3",
      name: "Water Tank Installation",
      description: "Installation of water tanks and plumbing connections",
      price: 8000,
      duration: "6-8 hours",
    },
  ],
  experience: 8,
  availability: {
    status: "available",
    schedule: [
      "Monday-Friday: 8:00 AM - 6:00 PM",
      "Saturday: 8:00 AM - 2:00 PM",
    ],
  },
  hourlyRate: 1500,
  description:
    "Experienced plumber with over 8 years of experience in residential and commercial plumbing.",
  skills: [
    "Pipe installation",
    "Leak detection",
    "Bathroom fitting",
    "Water heating systems",
  ],
  certifications: ["Licensed Plumber", "Safety Certified"],
  languages: ["Sinhala", "English", "Tamil"],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

const initialState: AuthState = {
  user: MOCK_USERS[0], // Start with a logged-in worker
  customerProfile: null,
  workerProfile: MOCK_WORKER_PROFILE,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  token: "mock-token-123456",
};

// Async thunks for authentication
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials) => {
    // Mock login - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find user by email (mock)
    const user = MOCK_USERS.find((u) => u.email === credentials.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Mock token
    const token = "mock-token-" + Date.now();

    // Determine profile based on role
    let customerProfile = null;
    let workerProfile = null;

    if (user.role === "customer") {
      customerProfile = MOCK_CUSTOMER_PROFILE;
    } else if (user.role === "worker") {
      workerProfile = MOCK_WORKER_PROFILE;
    }

    return { user, token, customerProfile, workerProfile };
  },
);

export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials) => {
    // Mock register - simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newUser: User = {
      id: "user-" + Date.now(),
      name: credentials.name,
      email: credentials.email,
      phone: credentials.phone,
      role: credentials.role,
      avatar: "https://i.pravatar.cc/300?img=" + Math.floor(Math.random() * 70),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerified: false,
      emailVerified: false,
      phoneVerified: false,
    };

    // Add to mock users
    MOCK_USERS.push(newUser);

    // Create appropriate profile
    let customerProfile = null;
    let workerProfile = null;

    if (credentials.role === "customer") {
      customerProfile = {
        id: "customer-" + Date.now(),
        userId: newUser.id,
        user: newUser,
        totalJobsPosted: 0,
        totalSpent: 0,
        averageRating: 0,
      };
    } else if (credentials.role === "worker") {
      workerProfile = {
        id: "worker-" + Date.now(),
        userId: newUser.id,
        user: newUser,
        profession: "",
        category: "",
        rating: 0,
        totalJobs: 0,
        verified: false,
        location: {
          district: "",
          city: "",
        },
        services: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const token = "mock-token-" + Date.now();

    return { user: newUser, token, customerProfile, workerProfile };
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  // Mock logout - clear any stored tokens
  localStorage.removeItem("authToken");
  return null;
});

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ userId, data }: { userId: string; data: UpdateProfileDto }) => {
    // Mock update profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    const userIndex = MOCK_USERS.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      throw new Error("User not found");
    }

    const updatedUser = {
      ...MOCK_USERS[userIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    MOCK_USERS[userIndex] = updatedUser;

    return updatedUser;
  },
);

export const updateCustomerProfile = createAsyncThunk(
  "auth/updateCustomerProfile",
  async ({
    customerId,
    data,
  }: {
    customerId: string;
    data: UpdateCustomerDto;
  }) => {
    // Mock update customer profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real app, this would be an API call
    const updatedProfile = {
      ...MOCK_CUSTOMER_PROFILE,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return updatedProfile;
  },
);

export const updateWorkerProfile = createAsyncThunk(
  "auth/updateWorkerProfile",
  async ({ workerId, data }: { workerId: string; data: UpdateWorkerDto }) => {
    // Mock update worker profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    const updatedProfile = {
      ...MOCK_WORKER_PROFILE,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return updatedProfile;
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setCustomerProfile: (
      state,
      action: PayloadAction<CustomerProfile | null>,
    ) => {
      state.customerProfile = action.payload;
    },
    setWorkerProfile: (state, action: PayloadAction<WorkerProfile | null>) => {
      state.workerProfile = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.customerProfile = action.payload.customerProfile;
      state.workerProfile = action.payload.workerProfile;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.error.message || "Login failed";
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.customerProfile = action.payload.customerProfile;
      state.workerProfile = action.payload.workerProfile;
      state.error = null;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.error.message || "Registration failed";
    });

    // Logout
    builder.addCase(logout.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.customerProfile = null;
      state.workerProfile = null;
      state.error = null;
    });
    builder.addCase(logout.rejected, (state) => {
      state.isLoading = false;
    });

    // Update Profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      // Update in profiles as well
      if (state.customerProfile) {
        state.customerProfile.user = action.payload;
      }
      if (state.workerProfile) {
        state.workerProfile.user = action.payload;
      }
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to update profile";
    });

    // Update Customer Profile
    builder.addCase(updateCustomerProfile.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateCustomerProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.customerProfile = action.payload;
    });
    builder.addCase(updateCustomerProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to update customer profile";
    });

    // Update Worker Profile
    builder.addCase(updateWorkerProfile.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateWorkerProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.workerProfile = action.payload;
    });
    builder.addCase(updateWorkerProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || "Failed to update worker profile";
    });
  },
});

export const {
  setUser,
  setCustomerProfile,
  setWorkerProfile,
  clearError,
  setLoading,
  updateUser,
} = authSlice.actions;

export default authSlice.reducer;
