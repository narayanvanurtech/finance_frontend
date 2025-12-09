// hooks/useRoleBasedRouter.ts
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/salesCrmStore/useAuthStore';

export function useRoleBasedRouter() {
  const router = useRouter();
  const { user } = useAuthStore();

  const pushToRolePath = (path: string) => {
    const prefix = user?.role === 'admin' ? '' : '/user';
    router.push(`${prefix}${path}`);
  };

  return { pushToRolePath };
}
