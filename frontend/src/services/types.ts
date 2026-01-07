export interface User {
  id: string
  email: string
  name: string
  timezone: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  date: string
  done: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface CreateTaskDto {
  title: string
  date: string
}

export interface UpdateTaskDto {
  title?: string
  date?: string
  done?: boolean
}