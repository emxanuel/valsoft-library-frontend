import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import { LoginPage } from "@/features/auth/pages/login-page"
import { ProtectedLayout } from "@/features/auth/pages/protected-layout"
import { RegisterPage } from "@/features/auth/pages/register-page"
import { AppLayout } from "@/features/shared/components/app-layout"
import { BookDetailPage } from "@/features/library/pages/book-detail-page"
import { BooksListPage } from "@/features/library/pages/books-list-page"
import { ClientDetailPage } from "@/features/library/pages/client-detail-page"
import { ClientsListPage } from "@/features/library/pages/clients-list-page"
import { LoanHistoryPage } from "@/features/library/pages/loan-history-page"
import { StaffListPage } from "@/features/admin/pages/staff-list-page"
import { LibraryHomePage } from "@/features/library/pages/library-home-page"
import { LoansPage } from "@/features/library/pages/loans-page"

export const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedLayout />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/library" replace />} />
            <Route path="library" element={<LibraryHomePage />} />
            <Route path="library/books" element={<BooksListPage />} />
            <Route path="library/loans/history" element={<LoanHistoryPage />} />
            <Route path="library/loans" element={<LoansPage />} />
            <Route path="library/clients/:clientId" element={<ClientDetailPage />} />
            <Route path="library/clients" element={<ClientsListPage />} />
            <Route path="admin/employees" element={<StaffListPage />} />
            <Route path="library/books/:bookId" element={<BookDetailPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/library" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
