// src/data/auth.js
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export async function login(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function signup(email, password) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function logout() {
  await signOut(auth);
}

export function listenToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}