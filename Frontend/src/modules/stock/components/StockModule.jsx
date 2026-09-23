import {
    Box,
    Flex,
    useDisclosure,
} from "@chakra-ui/react";

import { useState } from "react";

import StockTable from "./tables/StockTable";
import DetalleProducto from "./cards/DetalleProducto";

import StockNuevoProductoModal from "./modals/StockNuevoProductoModal";
import StockIngresoModal from "./modals/StockIngresoModal";
import StockIngresoMasivoModal from "./modals/StockIngresoMasivoModal";
import StockEgresoModal from "./modals/StockEgresoModal";
import StockAjusteModal from "./modals/StockAjusteModal";

import Sidebar from "../../../shared/components/Sidebar";

export default function StockModule({
    onDashboard,
    onHistorial,
}) {

    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

    const [productoSeleccionado, setProductoSeleccionado,] = useState(null);

    const [productoRapido, setProductoRapido,] = useState(null);

    const [actualizarStock, setActualizarStock] = useState(0);

    const nuevoProducto = useDisclosure();

    const ingreso = useDisclosure();

    const ingresoMasivo = useDisclosure();

    const egreso = useDisclosure();

    const ajuste = useDisclosure();

    return (
        <>

            <Sidebar
                onNuevoProducto={onOpen}
                onIngreso={ingresoModal.onOpen}
                onIngresoMasivo={ingresoMasivoModal.onOpen}
                onEgreso={egresoModal.onOpen}
                onAjuste={ajusteModal.onOpen}
                onHistorial={() => setPantalla("historial")}
                onStock={() => setPantalla("stock")}
                onDashboard={() => setPantalla("dashboard")}
            />

            <Box flex={1}>

                {pantalla === "dashboard" && (
                    <DashboardPage />
                )}

                {pantalla === "stock" && (
                    <Flex h="100%">
                        <Box flex={1}>

                            <StockTable
                                tipoSeleccionado={tipoSeleccionado}
                                setTipoSeleccionado={setTipoSeleccionado}
                                actualizarStock={actualizarStock}
                                setProductoSeleccionado={setProductoSeleccionado}
                            />

                        </Box>

                        <DetalleProducto
                            tipoSeleccionado={tipoSeleccionado}
                            productoSeleccionado={
                                productoSeleccionado
                            }
                            setProductoSeleccionado={
                                setProductoSeleccionado
                            }

                            onIngreso={() => {
                                setProductoRapido(
                                    productoSeleccionado
                                );
                                ingresoModal.onOpen();
                            }}

                            onEgreso={() => {
                                setProductoRapido(
                                    productoSeleccionado
                                );
                                egresoModal.onOpen();
                            }}

                            onAjuste={() => {
                                setProductoRapido(
                                    productoSeleccionado
                                );
                                ajusteModal.onOpen();
                            }}
                        />

                    </Flex>
                )}

                {pantalla === "historial" && (
                    <HistorialPage />
                )}

            </Box>

            <StockNuevoProductoModal
                isOpen={isOpen}
                onClose={onClose}
                onProductoCreado={() =>
                    setActualizarStock(
                        (prev) => prev + 1
                    )}
            />

            <StockIngresoModal
                productoRapido={productoRapido}
                isOpen={
                    ingresoModal.isOpen
                }
                onClose={
                    cerrarIngreso
                }
                onMovimientoCreado={() =>
                    setActualizarStock(
                        (prev) => prev + 1
                    )}
            />

            <StockIngresoMasivoModal
                isOpen={
                    ingresoMasivoModal.isOpen
                }
                onClose={
                    cerrarIngresoMasivo
                }
                onMovimientoCreado={() =>
                    setActualizarStock(
                        (prev) => prev + 1
                    )
                }
            />

            <StockEgresoModal
                productoRapido={productoRapido}
                isOpen={
                    egresoModal.isOpen
                }
                onClose={
                    cerrarEgreso
                }
                onMovimientoCreado={() =>
                    setActualizarStock(
                        (prev) => prev + 1
                    )}
            />

            <StockAjusteModal
                productoRapido={productoRapido}
                isOpen={
                    ajusteModal.isOpen
                }
                onClose={
                    cerrarAjuste
                }
                onMovimientoCreado={() =>
                    setActualizarStock(
                        (prev) => prev + 1
                    )}
            />

        </>
    );

}