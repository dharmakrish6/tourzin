"use client";
import { firebaseRepository } from "./firebase";
import type { Repository } from "./repository";

export const db: Repository = firebaseRepository;

export type { Repository, NewEnquiry } from "./repository";
