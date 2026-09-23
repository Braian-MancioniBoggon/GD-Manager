import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
  Button,
  Tooltip,
} from "@chakra-ui/react";

export default function WidgetCircle({

  tooltip,

  accionModal,

  children,

}) {

  return (

    
    <Tooltip label={tooltip} placement='bottom'>
      <button
        variant="ghost"
        w="100%"
        display="contents"
      >
        <Box
          bg="white"
          borderRadius="100%"
          boxShadow="lg"
          w="100px"
          h="100px"
          display="flex"
          alignItems={"center"}
          justifyContent={"center"}
          transition=".2s"
          _hover={{
            transform: "translateY(-3px)",
            boxShadow: "2xl",
          }}
          onClick={accionModal}
        >
          {children}
        </Box>
      </button>
    </Tooltip>

  );

}