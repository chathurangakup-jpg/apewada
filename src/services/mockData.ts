import { User, UserRole } from "../types";
import { Review } from "../types/customer.types";
import { Job, JobStatus, QuotationStatus } from "../types/job.types";
import { Worker } from "../types/worker.types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1234567890",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: UserRole.CUSTOMER,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "u2",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1234567891",
    avatar: "https://i.pravatar.cc/150?img=2",
    role: UserRole.WORKER,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "u3",
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+1234567892",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: UserRole.WORKER,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "u4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    phone: "+1234567893",
    avatar: "https://i.pravatar.cc/150?img=4",
    role: UserRole.CUSTOMER,
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-04T00:00:00Z",
  },
  {
    id: "u5",
    name: "Robert Brown",
    email: "robert@example.com",
    phone: "+1234567894",
    avatar: "https://i.pravatar.cc/150?img=5",
    role: UserRole.WORKER,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
  },
  {
    id: "u6",
    name: "Admin User",
    email: "admin@example.com",
    phone: "+1234567895",
    avatar: "https://i.pravatar.cc/150?img=6",
    role: UserRole.ADMIN,
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-06T00:00:00Z",
  },
];

// Mock Workers
export const mockWorkers: Worker[] = [
  {
    id: "w1",
    userId: "u2",
    profession: "Plumber",
    experience: 5,
    location: "Downtown",
    verified: true,
    rating: 4.8,
    totalJobs: 120,
    services: [
      {
        id: "s1",
        workerId: "w1",
        name: "Pipe Installation",
        description: "Installation of pipes for new buildings",
        price: 50,
        createdAt: "2024-01-02T00:00:00Z",
      },
      {
        id: "s2",
        workerId: "w1",
        name: "Leak Repair",
        description: "Fix any type of pipe leaks",
        price: 30,
        createdAt: "2024-01-02T00:00:00Z",
      },
    ],
    portfolio: [
      {
        id: "p1",
        workerId: "w1",
        title: "Bathroom Renovation",
        description: "Complete bathroom renovation with modern fixtures",
        imageUrl:
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500",
        createdAt: "2024-01-02T00:00:00Z",
      },
      {
        id: "p2",
        workerId: "w1",
        title: "Kitchen Plumbing",
        description: "New kitchen sink and dishwasher installation",
        imageUrl:
          "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500",
        createdAt: "2024-01-02T00:00:00Z",
      },
    ],
    user: mockUsers.find((u) => u.id === "u2")!,
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  {
    id: "w2",
    userId: "u3",
    profession: "Electrician",
    experience: 8,
    location: "Uptown",
    verified: true,
    rating: 4.9,
    totalJobs: 200,
    services: [
      {
        id: "s3",
        workerId: "w2",
        name: "Wiring Installation",
        description: "Full wiring installation for new buildings",
        price: 75,
        createdAt: "2024-01-03T00:00:00Z",
      },
    ],
    portfolio: [
      {
        id: "p3",
        workerId: "w2",
        title: "Smart Home Wiring",
        description: "Complete smart home electrical installation",
        imageUrl:
          "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500",
        createdAt: "2024-01-03T00:00:00Z",
      },
    ],
    user: mockUsers.find((u) => u.id === "u3")!,
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
  },
  {
    id: "w3",
    userId: "u5",
    profession: "Carpenter",
    experience: 6,
    location: "Midtown",
    verified: false,
    rating: 4.5,
    totalJobs: 80,
    services: [
      {
        id: "s4",
        workerId: "w3",
        name: "Furniture Making",
        description: "Custom furniture making",
        price: 60,
        createdAt: "2024-01-05T00:00:00Z",
      },
    ],
    portfolio: [
      {
        id: "p4",
        workerId: "w3",
        title: "Custom Desk",
        description: "Handmade wooden desk",
        imageUrl:
          "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500",
        createdAt: "2024-01-05T00:00:00Z",
      },
    ],
    user: mockUsers.find((u) => u.id === "u5")!,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-05T00:00:00Z",
  },
];

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: "j1",
    customerId: "u1",
    workerId: "w1",
    title: "Bathroom Plumbing Issue",
    description:
      "Need to fix leaking pipes in the bathroom. The pipes under the sink are leaking and need immediate attention.",
    category: "Plumbing",
    status: JobStatus.IN_PROGRESS,
    budget: 200,
    location: "123 Main St, Downtown",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
    quotation: {
      id: "q1",
      jobId: "j1",
      workerId: "w1",
      amount: 180,
      description:
        "Fix leaking pipes and replace old fittings. Includes 1 year warranty.",
      status: QuotationStatus.ACCEPTED,
      createdAt: "2024-01-11T10:00:00Z",
      updatedAt: "2024-01-11T10:00:00Z",
      worker: {
        id: "w1",
        name: "Jane Smith",
        avatar: "https://i.pravatar.cc/150?img=2",
        rating: 4.8,
      },
    },
    customer: {
      id: "u1",
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  },
  {
    id: "j2",
    customerId: "u4",
    title: "Electrical Wiring for New House",
    description:
      "Need complete electrical wiring for a 3-bedroom house. Must include all safety standards.",
    category: "Electrical",
    status: JobStatus.OPEN,
    budget: 500,
    location: "456 Oak St, Uptown",
    createdAt: "2024-01-15T14:00:00Z",
    updatedAt: "2024-01-15T14:00:00Z",
    customer: {
      id: "u4",
      name: "Sarah Williams",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
  },
  {
    id: "j3",
    customerId: "u1",
    workerId: "w2",
    title: "Smart Home Installation",
    description:
      "Install smart home devices including lights, thermostats, and security cameras.",
    category: "Electrical",
    status: JobStatus.COMPLETED,
    budget: 350,
    location: "123 Main St, Downtown",
    createdAt: "2024-01-05T09:00:00Z",
    updatedAt: "2024-01-08T16:00:00Z",
    quotation: {
      id: "q2",
      jobId: "j3",
      workerId: "w2",
      amount: 320,
      description:
        "Complete smart home installation with all devices setup and configuration.",
      status: QuotationStatus.ACCEPTED,
      createdAt: "2024-01-06T10:00:00Z",
      updatedAt: "2024-01-06T10:00:00Z",
      worker: {
        id: "w2",
        name: "Mike Johnson",
        avatar: "https://i.pravatar.cc/150?img=3",
        rating: 4.9,
      },
    },
    customer: {
      id: "u1",
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
  },
  {
    id: "j4",
    customerId: "u4",
    workerId: "w3",
    title: "Custom Desk Design",
    description:
      "Need a custom wooden desk for home office. Specific dimensions required.",
    category: "Carpentry",
    status: JobStatus.QUOTING,
    budget: 300,
    location: "789 Pine St, Midtown",
    createdAt: "2024-01-18T11:00:00Z",
    updatedAt: "2024-01-19T11:00:00Z",
    quotation: {
      id: "q3",
      jobId: "j4",
      workerId: "w3",
      amount: 280,
      description:
        "Custom oak desk with drawers. Includes finishing and installation.",
      status: QuotationStatus.PENDING,
      createdAt: "2024-01-19T11:00:00Z",
      updatedAt: "2024-01-19T11:00:00Z",
      worker: {
        id: "w3",
        name: "Robert Brown",
        avatar: "https://i.pravatar.cc/150?img=5",
        rating: 4.5,
      },
    },
    customer: {
      id: "u4",
      name: "Sarah Williams",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
  },
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: "r1",
    customerId: "u1",
    workerId: "w1",
    jobId: "j1",
    rating: 5,
    comment:
      "Excellent work! Very professional and completed on time. Would definitely hire again.",
    createdAt: "2024-01-13T10:00:00Z",
    updatedAt: "2024-01-13T10:00:00Z",
    customer: {
      id: "u1",
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    worker: {
      id: "w1",
      name: "Jane Smith",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
  },
  {
    id: "r2",
    customerId: "u1",
    workerId: "w2",
    jobId: "j3",
    rating: 4,
    comment:
      "Good work overall. Communication could be better but quality was excellent.",
    createdAt: "2024-01-09T15:00:00Z",
    updatedAt: "2024-01-09T15:00:00Z",
    customer: {
      id: "u1",
      name: "John Doe",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    worker: {
      id: "w2",
      name: "Mike Johnson",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
  },
];

// Mock Categories
export const mockCategories = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Cleaning",
  "Gardening",
  "HVAC",
  "Roofing",
  "Flooring",
  "General Maintenance",
];

// Helper functions
export const getWorkerById = (id: string) =>
  mockWorkers.find((w) => w.id === id);
export const getJobById = (id: string) => mockJobs.find((j) => j.id === id);
export const getReviewsByWorkerId = (workerId: string) =>
  mockReviews.filter((r) => r.workerId === workerId);
export const getJobsByWorkerId = (workerId: string) =>
  mockJobs.filter((j) => j.workerId === workerId);
export const getJobsByCustomerId = (customerId: string) =>
  mockJobs.filter((j) => j.customerId === customerId);
