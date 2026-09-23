import {
  Flex,
  Text,
  Badge,
} from "@chakra-ui/react";

export default function StockCriticoItem({
  nombre,
  stock,
}) {
  return (
    <Flex
      justify="space-between"
      align="center"
      py={2}
      borderBottom="1px solid"
      borderColor="gray.100"
    >
      <Text
        fontSize="sm"
        fontWeight="500"
        noOfLines={1}
      >
        {nombre}
      </Text>

      <Badge
        colorScheme="red"
        borderRadius="full"
        px={3}
      >
        {stock}
      </Badge>
    </Flex>
  );
}