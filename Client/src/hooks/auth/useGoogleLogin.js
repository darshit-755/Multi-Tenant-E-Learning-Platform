import { useMutation } from '@tanstack/react-query';
import { googleLoginApi } from '@/services/auth.api';

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: (token) => googleLoginApi(token),
  });
};
