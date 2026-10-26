"use client";
import { firebaseRepository } from "./firebase";
import { mockRepository } from "./mock";
import type { Repository } from "./repository";

export const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE === "firebase" ? "firebase" : "mock";

export const db: Repository = DATA_SOURCE === "firebase" ? firebaseRepository : mockRepository;

export type { Repository, NewEnquiry } from "./repository";
