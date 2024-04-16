import {
    Button,
    Modal,
    Image,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure
} from "@nextui-org/react";
import React from "react";

export default function ImageModal({data}) {
    const {isOpen, onOpen, onOpenChange} = useDisclosure()

    return (
        <>
            <Button onPress={onOpen}>Preview Image</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} size={"5xl"}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody>
                                <Image
                                    src={data.url} className="w-full" alt="Image preview"/>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="success" target="_blank" onClick={() => window.open(data.url)}>
                                    Download
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    )
}
