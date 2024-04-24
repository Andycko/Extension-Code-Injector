import {Tab, Tabs} from "@nextui-org/react";
import ClientList from "./ClientList";
import ScreenshotList from "./ScreenshotList";
import {useState} from "react";
import CameraList from "./CameraList";

/**
 * `ListTabs` is a React component that displays a set of tabs.
 *
 * It maintains one piece of state:
 * - `selected`: a string indicating the currently selected tab.
 *
 * The tabs include "Clients", "Screenshots", and "Camera Captures", each displaying a corresponding list component.
 *
 * @example
 * return (
 *   <ListTabs />
 * )
 */
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
                <Tab key="cameraCaptures" title="Camera Captures" className="h-full flex-1">
                    <CameraList />
                </Tab>
            </Tabs>
        </div>
    );
}
