import {Tab, Tabs} from "@nextui-org/react";
import ClientList from "./ClientList";
import ScreenshotList from "./ScreenshotList";
import {useState} from "react";

export default function ListTabs() {
    const [selected, setSelected] = useState("clients");

    return (
        <div className="flex flex-col w-full lg:w-3/4">
            <Tabs
                aria-label="Options"
                selectedKey={selected}
                onSelectionChange={setSelected}
            >
                <Tab key="clients" title="Clients" className="h-full flex-1">
                    <ClientList />
                </Tab>
                <Tab key="screenshots" title="Screenshots" className="h-full flex-1">
                    <ScreenshotList />
                </Tab>
            </Tabs>
        </div>
    );
}
