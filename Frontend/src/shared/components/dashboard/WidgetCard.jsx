import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";

export default function WidgetCard({

  title,

  icon,

  children,

  footer,

  minH = "260px",

}) {

  return (

    <Box
      bg="white"
      borderRadius="2xl"
      boxShadow="lg"
      p={6}
      h="100%"
      minH={minH}
      transition=".2s"
      _hover={{
        transform: "translateY(-3px)",
        boxShadow: "2xl",
      }}
    >

      <Flex
        align="center"
        mb={5}
      >

        {icon && (

          <Icon
            as={icon}
            mr={3}
            boxSize={5}
            color="red.500"
          />

        )}

        <Heading
          size="md"
        >
          {title}
        </Heading>

      </Flex>

      <Box
        minH={310}
        maxH={310}
        overflow={"auto"}
        sx={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#E20A19",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#e20a1893",
          },
        }}
      >

        {children}

      </Box>

      {footer && (

        <Box mt={5}>

          {footer}

        </Box>

      )}

    </Box>

  );

}