import { Forum, Home, Inbox, PeopleAlt, SignalCellularAlt } from "@mui/icons-material";

export const menuData = {
    Admin:[
        {
        label: "Main",
        items: [
            {
                name: "dashboard", icon: Home,route: "/dashboard",
            },
             {
                name: "Analytics", icon: SignalCellularAlt,
                subMenu: [
                    { name: "Customers", route: "analytics/customers" },
                ]
            },
            {
                name: "Chat", icon: Forum,route:"chat",
            },
            {
                name: "Inbox", icon: Inbox,route:"inbox",
            },

            {
                name: "Team", icon: PeopleAlt,route:"team",
            },
            {
                 name: "Reports", icon: SignalCellularAlt,
                subMenu: [
                    {
                        name: "Agents",
                        nestedSubMenu: [
                            { name: "Agents performance", route: "reports/performance" },
                            { name: "Agent activity", route: "reports/activity" },
                        ],
                    },
                ]
            }

        ]
    }],
    Agent:[
        {
        label: "Main",
        items: [
            {
                name: "dashboard", icon: Home,route: "dashboard",
            },
            //  {
            //     name: "Analytics", icon: SignalCellularAlt,
            //     subMenu: [
            //         { name: "Customers", route: "analytics/customers" },
            //     ]
            // },
            {
                name: "Chat", icon: Forum,route:"chat",
            },
            {
                name: "Inbox", icon: Inbox,route:"inbox",
            },
            // {
            //     name: "Reports", icon: SignalCellularAlt,
            //     subMenu: [
            //         { name: "Performance", route: "reports/performance" },
            //         { name: "Activity", route: "reports/activity" },
            //     ]
            // }
        ]
    }],
    QA:[
        {
        label: "Main",
        items: [
            {
                name: "dashboard", icon: Home,route: "/dashboard",
            },
             {
                name: "Analytics", icon: SignalCellularAlt,
                subMenu: [
                    { name: "Customers", route: "analytics/customers" },
                ]
            },
            {
                name: "Chat", icon: Forum,route:"chat",
            },
            {
                name: "Inbox", icon: Inbox,route:"inbox",
            },
            {
                name: "Team", icon: PeopleAlt,route:"team",
            },
        ]
    }],
    Customer: [
    { name: "Home", icon: Home, route: "/" },
    { name: "Chat", icon: Forum, route: "/chat" },
    { name: "Inbox", icon: Inbox, route: "/inbox" },
  ],
}



