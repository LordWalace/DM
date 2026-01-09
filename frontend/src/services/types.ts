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
  date: string               // início (ISO)
  endDate?: string | null    // fim (ISO) opcional
  allDay: boolean            // tarefa de dia todo
  durationMinutes?: number | null
  done: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  date: string               // início
  allDay?: boolean
  endDate?: string
  durationMinutes?: number
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RegisterResponse {
  accessToken: string
  user: User
}