import {
  Box,
  Checkbox,
  CheckboxGroup,
  Heading,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";

import { nombrePermiso } from "../../../../shared/utils/formatoTexto";

export default function SelectorPermisos({

  permisosDisponibles = [],

  permisosSeleccionados = [],

  onChange,

}) {

  return (

    <Box>

      <Heading
        size="sm"
        mb={4}
      >

        Permisos

      </Heading>

      <CheckboxGroup

        value={
          permisosSeleccionados
        }

        onChange={
          onChange
        }

      >

        <SimpleGrid

          columns={2}

          spacing={3}

        >

          {permisosDisponibles.map(

            (permiso) => (

              <Checkbox

                key={permiso}

                value={permiso}

              >

                {nombrePermiso(
                  permiso
                )}

              </Checkbox>

            )

          )}

        </SimpleGrid>

      </CheckboxGroup>

    </Box>

  );

}