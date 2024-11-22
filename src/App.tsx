import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import { List } from './containers/List'
import { Login } from './containers/Login'
import { ProtectedRoute } from './routers/ProtectedRoute'
import { PublicRoute } from './routers/PublicRoute'

function App() {
  return (
    <div className="flex w-full h-full justify-center items-center">
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/list"
            element={
              <ProtectedRoute>
                <List />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <List />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  )
}

export default App
