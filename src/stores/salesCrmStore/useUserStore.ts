import { create } from 'zustand';
import { User, CreateUserRequest, getAllUsers, getUserById, createUser, updateUser, deleteUser, toggleUserActiveStatus } from '@/api/userApi';

interface UserState {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  fetchUsers: (userType: string, page?: number, limit?: number) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  addUser: (userData: CreateUserRequest) => Promise<void>;
  updateUserData: (id: string, userData: Partial<User>) => Promise<void>;
  removeUser: (id: string) => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  clearError: () => void;
  toggleUserStatus: (id: string, isActive: boolean) => Promise<void>;
}

const useUserStore = create<UserState>((set, get) => ({
  users: [],
  currentUser: null,
  loading: false,
  error: null,

  fetchUsers: async (userType: string, page: number = 1, limit: number = 10) => {
    try {
      set({ loading: true, error: null });
      const users = await getAllUsers(userType, page, limit);
      set({ users, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchUserById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const user = await getUserById(id);
      set({ currentUser: user, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addUser: async (userData: CreateUserRequest) => {
    try {
      set({ loading: true, error: null });
      const newUser = await createUser(userData);
      set((state) => ({ users: [...state.users, newUser], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateUserData: async (id: string, userData: Partial<User>) => {
    try {
      set({ loading: true, error: null });
      const updatedUser = await updateUser(id, userData);
      set((state) => ({
        users: state.users.map((user) => (user._id === id ? updatedUser : user)),
        currentUser: state.currentUser?._id === id ? updatedUser : state.currentUser,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  removeUser: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await deleteUser(id);
      const currentState = get();
      await currentState.fetchUsers('USER', 1, 10);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  toggleUserStatus: async (id: string, isActive: boolean) => {
    try {
      set({ loading: true, error: null });
      const updatedUser = await toggleUserActiveStatus(id, isActive);
      set((state) => ({
        users: state.users.map((user) => (user._id === id ? updatedUser : user)),
        currentUser: state.currentUser?._id === id ? updatedUser : state.currentUser,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  setCurrentUser: (user: User | null) => set({ currentUser: user }),
  clearError: () => set({ error: null }),
}));

export default useUserStore;
