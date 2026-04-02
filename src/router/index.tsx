import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import { AppLayout } from "@/features/shared/components/app-layout"
import { StaffListPage } from "@/pages/admin/staff-list-page"
import { LoginPage } from "@/pages/auth/login-page"
import { ProtectedLayout } from "@/pages/auth/protected-layout"
import { RegisterPage } from "@/pages/auth/register-page"
import { BookDetailPage } from "@/pages/books/book-detail-page"
import { BooksListPage } from "@/pages/books/books-list-page"
import { ClientDetailPage } from "@/pages/clients/client-detail-page"
import { ClientsListPage } from "@/pages/clients/clients-list-page"
import { LibraryHomePage } from "@/pages/library-home-page"
import { LoanHistoryPage } from "@/pages/loans/loan-history-page"
import { LoansPage } from "@/pages/loans/loans-page"

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
