import {
  Grid,
} from "@chakra-ui/react";

export default function DashboardGrid({

  children,

}) {

  return (

    <Grid

      templateColumns={{
        base: "1fr",
        xl: "repeat(12,1fr)",
      }}

      gap={6}

    >

      {children}

    </Grid>

  );

}