export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  date: string
  done: boolean
  userId: string
  createdAt: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  date: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface RegisterResponse {
  user: User
  token: string
}