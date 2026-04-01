import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import { LoginPage } from "@/features/auth/pages/login-page"
import { ProtectedLayout } from "@/features/auth/pages/protected-layout"
import { RegisterPage } from "@/features/auth/pages/register-page"
import { AppLayout } from "@/features/shared/components/app-layout"
import { BookDetailPage } from "@/features/library/pages/book-detail-page"
import { LibraryPage } from "@/features/library/pages/library-page"

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedLayout />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/library" replace />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="library/books/:bookId" element={<BookDetailPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/library" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
