import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Nav from "./components/Nav";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NoticesList from "./pages/NoticesList";
import NoticeDetail from "./pages/NoticeDetail";
import CreateNotice from "./pages/CreateNotice";
import Queries from "./pages/Queries";
import Admin from "./pages/dashboards/Admin";
import Faculty from "./pages/dashboards/Faculty";
import Student from "./pages/dashboards/Student";
import { Footer } from "./components/index";
import { isAuthed } from "./lib/auth";

function PrivateRoute({ children }: { children: ReactNode }) {
  return isAuthed() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            <Route path="/faculty" element={<PrivateRoute><Faculty /></PrivateRoute>} />
            <Route path="/student" element={<PrivateRoute><Student /></PrivateRoute>} />
            <Route path="/notices" element={<PrivateRoute><NoticesList /></PrivateRoute>} />
            <Route path="/notices/:id" element={<PrivateRoute><NoticeDetail /></PrivateRoute>} />
            <Route path="/create" element={<PrivateRoute><CreateNotice /></PrivateRoute>} />
            <Route path="/notices/:id/edit" element={<PrivateRoute><CreateNotice /></PrivateRoute>} />
            <Route path="/queries" element={<PrivateRoute><Queries /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
