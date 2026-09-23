import {
  GridItem,
} from "@chakra-ui/react";

export default function DashboardItem({

  col = 4,

  row = 1,

  children,

}) {

  return (

    <GridItem

      colSpan={col}

      rowSpan={row}

    >

      {children}

    </GridItem>

  );

}