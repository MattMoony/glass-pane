import { defineStore } from 'pinia';
import { shallowRef, type ShallowRef } from 'vue';
import User from '@/models/User';

/**
 * The user store.
 * @returns The user store.
 */
export const useUserStore = defineStore('user', () => {
  const user: ShallowRef<User|null> = shallowRef(
    localStorage.getItem('user') 
    ? User.fromJSON(JSON.parse(localStorage.getItem('user')!)) 
    : null
  );
  const logout = () => user.value = null;
  return { user, logout, };
});
