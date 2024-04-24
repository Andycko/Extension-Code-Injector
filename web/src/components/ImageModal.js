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

/**
 * `ImageModal` is a React component that displays an image in a modal.
 *
 * It maintains the following state:
 * - `isOpen`: a boolean indicating whether the modal is open or not.
 *
 * It uses the `useDisclosure` hook from @nextui-org/react to control the opening and closing of the modal.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Object} props.data - The data for the image to be displayed.
 * @param {string} props.data.url - The URL of the image to be displayed.
 *
 * @example
 * return (
 *   <ImageModal data={{ url: 'https://example.com/image.jpg' }} />
 * )
 */
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
