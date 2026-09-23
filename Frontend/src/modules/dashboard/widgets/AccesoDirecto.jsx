import {
  Button,
  Icon,
  Spinner,
  Text,
} from "@chakra-ui/react";

import {
  useEffect,
  useState,
} from "react";

import WidgetCircle from "../../../shared/components/dashboard/WidgetCircle";

export default function StockProximoWidget({
  accionModal,
  tooltip,
  icono,
}) {  

  return (

    <WidgetCircle tooltip={tooltip} accionModal={accionModal}>
      <Icon as={icono} boxSize={55}/>
    </WidgetCircle>

  );

}