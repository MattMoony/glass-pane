import { defineStore } from 'pinia';
import { shallowRef, type ShallowRef } from 'vue';

import * as auth from '@/api/auth';
import User from '@/models/User';

/**
 * The user store.
 * @returns The user store.
 */
export const useUserStore = defineStore('user', () => {
  const user: ShallowRef<User|null> = shallowRef(null);
  const logout = () => user.value = null;
  (async () => {
    const res = await auth.status();
    if (res.user) user.value = User.fromJSON(res.user);
  })();
  return { user, logout, };
});
