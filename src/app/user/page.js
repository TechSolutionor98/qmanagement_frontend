'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UserIndex() {
  const router = useRouter();

  useEffect(() => {
    router.push('/user/dashboard');
  }, [router]);

  return null;
}
