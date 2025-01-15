import { createBrowserRouter } from "react-router-dom"
import App from "../App"
import About from "../components/About"
import FileUpload from "../components/FileUpload"
import Pricing from "../components/Pricing"
import Login from "../scenes/Authentication/Login"
import Signup from "../scenes/Authentication/Signup"
import Dashboard from "../scenes/Dashboard/Dashboard"
import DashboardLayout from "../scenes/Dashboard/DashboardLayout"
import Home from "../scenes/Home/Home"
import Test from "../scenes/Test/Test"


const Router = createBrowserRouter([
    {
        path:"/",
        element:<App/>,
        children:[
            {
                path:'/',
                element:<Home/>
            },
            {
                path:'/signup',
                element:<Signup/>
            },
            {
                path:'/login',
                element:<Login/>
            },
            {
                path:"/about",
                element:<About/>
            },
            {
                path:"/pricing",
                element:<Pricing/>
            },
            {
                path:"/test",
                element:<Test/>
            },
            {
                path:"/dashboard",
                element:<DashboardLayout/>,
                children:[
                    {
                        path:'/dashboard/home',
                        element:<Dashboard/>
                    },
                    {
                        path:"/dashboard/uploadPdf",
                        element:<FileUpload/>
                    },
                ]
            }
        ]

    }
])

export default Router