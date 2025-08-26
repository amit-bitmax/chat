import { Forum, Home, Inbox, Pages, PeopleAlt, SignalCellularAlt } from "@mui/icons-material";

export const menuData = {
    Admin:[
        {
        label: "Navigation",
        items: [
            {
                name: "dashboard", icon: Home,route: "dashboard",
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
                name: "ChatDemo", icon: Forum,route:"chatdemo",
            },
            {
                name: "NewChat", icon: Forum,route:"newchat",
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
        label: "Navigation",
        items: [
            {
                name: "dashboard", icon: Home,route: "dashboard",
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
                name: "ChatDemo", icon: Forum,route:"chatdemo",
            },
            {
                name: "NewChat", icon: Forum,route:"newchat",
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
    QA:[
        {
        label: "Navigation",
        items: [
            {
                name: "dashboard", icon: Home,route: "dashboard",
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
                name: "ChatDemo", icon: Forum,route:"chatdemo",
            },
            {
                name: "NewChat", icon: Forum,route:"newchat",
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
    Customer: [
    { name: "Home", icon: Home, route: "/" },
    { name: "Chat", icon: Forum, route: "/chat" },
    { name: "Inbox", icon: Inbox, route: "/inbox" },
  ],
}



