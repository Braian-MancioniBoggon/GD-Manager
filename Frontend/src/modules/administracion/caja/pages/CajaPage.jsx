import {
    Box,
    Flex,
    Text,
    Badge,
    Button,
    Spinner,
    Center,
    SimpleGrid,
    Input,
    FormControl,
    FormLabel,
    InputGroup,
    InputLeftElement,
    Icon,
    useDisclosure,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Divider,
} from "@chakra-ui/react";

import {
    FiDollarSign,
    FiPlus,
    FiEdit,
    FiTrash2,
    FiCheck,
    FiX,
    FiArrowLeft,
} from "react-icons/fi";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import api from "../../../../shared/services/api";

import ModalAgregarIngreso from "../components/modals/ModalAgregarIngreso";
import ModalAgregarEgreso from "../components/modals/ModalAgregarEgreso";
import ModalAgregarGastoBanco from "../components/modals/ModalAgregarGastoBanco";
import ModalAgregarCheque from "../components/modals/ModalAgregarCheque";

export default function CajaPage({ cajaId = null, modoConsulta = false, onVolver }) {

    const [
        caja,
        setCaja,
    ] = useState(null);

    const [
        cargando,
        setCargando,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState(null);

    const [
        abriendoCaja,
        setAbriendoCaja,
    ] = useState(false);

    const [
        mostrarSaldoInicial,
        setMostrarSaldoInicial,
    ] = useState(false);

    const [
        saldoInicial,
        setSaldoInicial,
    ] = useState("");

    const modalIngreso =
        useDisclosure();

    const [
        egresoModalAbierto,
        setEgresoModalAbierto,
    ] = useState(false);

    const [
        categoriaEgreso,
        setCategoriaEgreso,
    ] = useState("egresos");

    const [
        gastoBancoModalAbierto,
        setGastoBancoModalAbierto,
    ] = useState(false);

    const [
        chequeModalAbierto,
        setChequeModalAbierto,
    ] = useState(false);

    const [
        chequeSeleccionado,
        setChequeSeleccionado,
    ] = useState(null);

    const [
        ingresoSeleccionado,
        setIngresoSeleccionado,
    ] = useState(null);

    const [contableEditandoId, setContableEditandoId] = useState(null);
    const [contableFecha, setContableFecha] = useState("");
    const [guardandoContableId, setGuardandoContableId] = useState(null);
    const [errorContable, setErrorContable] = useState("");

    const [
        egresoSeleccionado,
        setEgresoSeleccionado,
    ] = useState(null);

    const [
        gastoBancoSeleccionado,
        setGastoBancoSeleccionado,
    ] = useState(null);

    const [
        confirmacion,
        setConfirmacion,
    ] = useState(null);

    const cancelarConfirmacionRef = useRef(null);


    // ========================================
    // ABRIR MODAL EGRESO
    // ========================================

    const abrirEgreso = (
        categoria = "egresos"
    ) => {

        setCategoriaEgreso(
            categoria
        );

        setEgresoModalAbierto(
            true
        );

    };


    // ========================================
    // ACTUALIZAR CAJA DESDE MODAL
    // ========================================

    const actualizarCajaDesdeModal = (
        cajaActualizada
    ) => {

        if (cajaActualizada) {

            setCaja(
                cajaActualizada
            );

        }

    };


    // ========================================
    // ABRIR GASTO BANCO
    // ========================================

    const abrirGastoBanco = () => {

        setGastoBancoSeleccionado(
            null
        );

        setGastoBancoModalAbierto(
            true
        );

    };

    // ========================================
    // ABRIR CHEQUE
    // ========================================

    const abrirCheque = (
        cheque = null
    ) => {

        setChequeSeleccionado(
            cheque
        );

        setChequeModalAbierto(
            true
        );

    };

    // ========================================
    // ELIMINAR CHEQUE
    // ========================================

    const eliminarCheque = async (cheque, confirmado = false) => {
        if (!cheque?._id) {
            return;
        }
    
        if (!confirmado) {
            setConfirmacion({
                mensaje: `¿Está seguro de eliminar el cheque ${cheque.numero}?`,
                accion: () => eliminarCheque(cheque, true),
            });
            return;
        }
    
        try {
            setError(null);
        
            const respuesta = await api.delete(
                `/caja/${caja._id}/cheques/${cheque._id}`
            );
        
            setCaja(respuesta.data.caja);
        } catch (error) {
            console.error("Error eliminando cheque:", error);
        
            setError(
                error.response?.data?.mensaje ||
                "No se pudo eliminar el cheque."
            );
        }
    };


    // ========================================
    // EDITAR INGRESO
    // ========================================

    const editarIngreso = (
        ingreso
    ) => {

        setIngresoSeleccionado(
            ingreso
        );

        modalIngreso.onOpen();

    };


    // ========================================
    // EDITAR FECHA CONTABLE DESDE LA TABLA
    // ========================================

    const obtenerFechaParaInput = (fecha) => {
        if (!fecha) return "";

        if (typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}/.test(fecha)) {
            return fecha.slice(0, 10);
        }

        const fechaConvertida = new Date(fecha);
        if (Number.isNaN(fechaConvertida.getTime())) return "";

        const anio = fechaConvertida.getFullYear();
        const mes = String(fechaConvertida.getMonth() + 1).padStart(2, "0");
        const dia = String(fechaConvertida.getDate()).padStart(2, "0");
        return `${anio}-${mes}-${dia}`;
    };

    const iniciarEdicionContable = (ingreso) => {
        setContableEditandoId(ingreso._id);
        setContableFecha(obtenerFechaParaInput(ingreso.contable));
        setErrorContable("");
    };

    const cancelarEdicionContable = () => {
        setContableEditandoId(null);
        setContableFecha("");
        setErrorContable("");
    };

    const guardarFechaContable = async (ingreso) => {
        if (!ingreso?._id || !caja?._id || guardandoContableId) return;

        try {
            setGuardandoContableId(ingreso._id);
            setErrorContable("");

            const respuesta = await api.put(
                `/caja/${caja._id}/ingresos/${ingreso._id}/contable`,
                { contable: contableFecha || null }
            );

            if (respuesta.data?.caja) {
                setCaja(respuesta.data.caja);
            } else {
                // Respaldo si el endpoint devuelve solamente el ingreso actualizado.
                setCaja((cajaActual) => ({
                    ...cajaActual,
                    ingresos: (cajaActual?.ingresos || []).map((item) =>
                        item._id === ingreso._id
                            ? { ...item, contable: contableFecha || null }
                            : item
                    ),
                }));
            }

            cancelarEdicionContable();
        } catch (error) {
            console.error("Error actualizando fecha contable:", error);
            setErrorContable(
                error.response?.data?.mensaje ||
                "No se pudo actualizar la fecha contable."
            );
        } finally {
            setGuardandoContableId(null);
        }
    };


    // ========================================
    // ELIMINAR INGRESO
    // ========================================

    const eliminarIngreso = async (ingreso, confirmado = false) => {
        if (!ingreso?._id) {
            return;
        }

        if (!confirmado) {
            setConfirmacion({
                mensaje: `¿Está seguro de eliminar el ingreso de "${ingreso.cliente}"?`,
                accion: () => eliminarIngreso(ingreso, true),
            });
            return;
        }

        try {
            setError(null);

            const respuesta = await api.delete(
                `/caja/${caja._id}/ingresos/${ingreso._id}`
            );

            setCaja(respuesta.data.caja);
            setIngresoSeleccionado(null);
        } catch (error) {
            console.error("Error eliminando ingreso:", error);

            setError(
                error.response?.data?.mensaje ||
                "No se pudo eliminar el ingreso."
            );
        }
    };


    // ========================================
    // EDITAR EGRESO
    // ========================================

    const editarEgreso = (
        egreso,
        categoria
    ) => {

        setCategoriaEgreso(
            categoria
        );

        setEgresoSeleccionado(
            egreso
        );

        setEgresoModalAbierto(
            true
        );

    };


    // ========================================
    // ELIMINAR EGRESO
    // ========================================

    const eliminarEgreso = async (
        egreso,
        categoria,
        confirmado = false
    ) => {
        if (!egreso?._id) {
            return;
        }

        if (!confirmado) {
            setConfirmacion({
                mensaje: `¿Está seguro de eliminar el egreso "${egreso.detalle}"?`,
                accion: () => eliminarEgreso(egreso, categoria, true),
            });
            return;
        }

        try {
            setError(null);

            const respuesta = await api.delete(
                `/caja/${caja._id}/egresos/${categoria}/${egreso._id}`
            );

            setCaja(respuesta.data.caja);
            setEgresoSeleccionado(null);
        } catch (error) {
            console.error("Error eliminando egreso:", error);

            setError(
                error.response?.data?.mensaje ||
                "No se pudo eliminar el egreso."
            );
        }
    };


    // ========================================
    // EDITAR GASTO BANCO
    // ========================================


    const editarGastoBanco = (
        gasto
    ) => {

        setGastoBancoSeleccionado(
            gasto
        );

        setGastoBancoModalAbierto(
            true
        );

    };


    // ========================================
    // ELIMINAR GASTO BANCO
    // ========================================

    const eliminarGastoBanco = async (
        gasto,
        confirmado = false
    ) => {
        if (!gasto?._id) {
            return;
        }

        if (!confirmado) {
            setConfirmacion({
                mensaje: `¿Está seguro de eliminar el gasto "${gasto.detalle}"?`,
                accion: () => eliminarGastoBanco(gasto, true),
            });
            return;
        }

        try {
            setError(null);

            const respuesta = await api.delete(
                `/caja/${caja._id}/gastos-banco/${gasto._id}`
            );

            setCaja(respuesta.data.caja);
            setGastoBancoSeleccionado(null);
        } catch (error) {
            console.error("Error eliminando gasto por banco:", error);

            setError(
                error.response?.data?.mensaje ||
                "No se pudo eliminar el gasto."
            );
        }
    };


    // ========================================
    // OBTENER CAJA ACTUAL
    // ========================================

    const obtenerCaja = async () => {

        try {

            setCargando(true);

            setError(null);

            const respuesta =
                await api.get(
                    cajaId ? `/caja/${cajaId}` : "/caja/actual"
                );

            setCaja(
                respuesta.data.caja || null
            );

        } catch (error) {

            console.error(
                "Error obteniendo caja:",
                error
            );

            setError(
                "No se pudo obtener la caja."
            );

        } finally {

            setCargando(false);

        }

    };


    // ========================================
    // CARGA INICIAL
    // ========================================

    useEffect(() => {

        obtenerCaja();

    }, [cajaId]);


    // ========================================
    // FORMATEAR IMPORTE
    // ========================================

    const formatearImporte = (
        importe
    ) => {

        return Number(
            importe || 0
        ).toLocaleString(
            "es-AR",
            {
                style: "currency",
                currency: "ARS",
                minimumFractionDigits: 0,
            }
        );

    };


    // ========================================
    // FORMATEAR FECHA
    // ========================================

    const formatearFecha = (fecha) => {
        if (!fecha) {
            return "-";
        }

        // Las fechas YYYY-MM-DD son fechas contables sin hora.
        // No convertirlas con new Date(), porque UTC-3 puede restar un día.
        if (typeof fecha === "string") {
            const coincidencia = fecha.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (coincidencia) {
                const [, anio, mes, dia] = coincidencia;
                return `${dia}/${mes}/${anio}`;
            }
        }

        const fechaConvertida = new Date(fecha);
        if (Number.isNaN(fechaConvertida.getTime())) {
            return "-";
        }

        return fechaConvertida.toLocaleDateString("es-AR");
    };


    // ========================================
    // ABRIR CAJA
    // ========================================

    const abrirCaja = async () => {

        try {

            setAbriendoCaja(true);

            setError(null);

            // ====================================
            // PRIMERA CAJA
            // ====================================

            if (mostrarSaldoInicial) {

                if (
                    saldoInicial === "" ||
                    saldoInicial === null
                ) {

                    setError(
                        "Debe ingresar el saldo inicial."
                    );

                    return;
                }

                const importe =
                    Number(
                        saldoInicial
                    );

                if (
                    Number.isNaN(importe) ||
                    importe < 0
                ) {

                    setError(
                        "El saldo inicial no es válido."
                    );

                    return;
                }

                const respuesta =
                    await api.post(
                        "/caja",
                        {
                            saldoInicial:
                                importe,
                        }
                    );

                setCaja(
                    respuesta.data.caja
                );

                setMostrarSaldoInicial(
                    false
                );

                setSaldoInicial(
                    ""
                );

                return;
            }


            // ====================================
            // APERTURA NORMAL
            // ====================================

            const respuesta =
                await api.post(
                    "/caja"
                );

            setCaja(
                respuesta.data.caja
            );

        } catch (error) {

            console.error(
                "Error abriendo caja:",
                error
            );

            // ====================================
            // PRIMERA CAJA
            // ====================================

            if (
                error.response?.data
                    ?.requiereSaldoInicial
            ) {

                setMostrarSaldoInicial(
                    true
                );

                setError(null);

                return;
            }


            // ====================================
            // ERROR GENERAL
            // ====================================

            setError(
                error.response?.data
                    ?.mensaje ||
                "No se pudo abrir la caja."
            );

        } finally {

            setAbriendoCaja(false);

        }

    };


    // ========================================
    // CERRAR CAJA
    // ========================================

    const cerrarCaja = async () => {
        if (!caja?._id || !estaAbierta) return;
        const confirmar = window.confirm(
            "¿Querés cerrar la caja de hoy? Después de cerrarla, no se podrán agregar ni modificar movimientos normales."
        );
        if (!confirmar) return;

        try {
            setCargando(true);
            setError(null);
            const respuesta = await api.post(`/caja/${caja._id}/cerrar`);
            setCaja(respuesta.data.caja || { ...caja, estado: "CERRADA" });
        } catch (error) {
            console.error("Error cerrando caja:", error);
            setError(error.response?.data?.mensaje || "No se pudo cerrar la caja.");
        } finally {
            setCargando(false);
        }
    };


    // ========================================
    // CARGANDO
    // ========================================

    if (cargando) {

        return (

            <Flex
                direction="column"
                h="100vh"
                bg="gray.100"
                overflow="hidden"
            >

                <Box
                    bg="white"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    px={8}
                    py={6}
                >

                    <Text
                        fontSize="2xl"
                        fontWeight="700"
                        color="gray.800"
                    >
                        Caja
                    </Text>

                    <Text
                        mt={1}
                        fontSize="sm"
                        color="gray.500"
                    >
                        Administración de caja diaria
                    </Text>

                </Box>

                <Center
                    flex={1}
                >

                    <Spinner
                        size="lg"
                        color="gray.500"
                    />

                </Center>

            </Flex>

        );

    }


    // ========================================
    // ERROR
    // ========================================

    if (
        error &&
        !mostrarSaldoInicial
    ) {

        return (

            <Flex
                direction="column"
                h="100vh"
                bg="gray.100"
                overflow="hidden"
            >

                <Box
                    bg="white"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    px={8}
                    py={6}
                >

                    <Text
                        fontSize="2xl"
                        fontWeight="700"
                        color="gray.800"
                    >
                        Caja
                    </Text>

                    <Text
                        mt={1}
                        fontSize="sm"
                        color="gray.500"
                    >
                        Administración de caja diaria
                    </Text>

                </Box>

                <Center
                    flex={1}
                    flexDirection="column"
                >

                    <Text
                        fontSize="md"
                        fontWeight="600"
                        color="gray.600"
                    >
                        {error}
                    </Text>

                    <Button
                        mt={4}
                        colorScheme="red"
                        onClick={obtenerCaja}
                    >
                        Reintentar
                    </Button>

                </Center>

            </Flex>

        );

    }


    // ========================================
    // SIN CAJA
    // ========================================

    if (!caja) {

        return (

            <Flex
                direction="column"
                h="100vh"
                bg="gray.100"
                overflow="hidden"
            >

                <Box
                    bg="white"
                    borderBottom="1px solid"
                    borderColor="gray.200"
                    px={8}
                    py={6}
                >

                    <Text
                        fontSize="2xl"
                        fontWeight="700"
                        color="gray.800"
                    >
                        Caja
                    </Text>

                    <Text
                        mt={1}
                        fontSize="sm"
                        color="gray.500"
                    >
                        Administración de caja diaria
                    </Text>

                </Box>


                <Center
                    flex={1}
                    p={8}
                >

                    <Box
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        px={10}
                        py={10}
                        maxW="500px"
                        w="100%"
                    >

                        <Text
                            fontSize="lg"
                            fontWeight="700"
                            color="gray.700"
                            textAlign="center"
                        >
                            No hay una caja abierta
                        </Text>

                        <Text
                            mt={2}
                            fontSize="sm"
                            color="gray.500"
                            textAlign="center"
                        >
                            La caja correspondiente al día de hoy
                            todavía no fue abierta.
                        </Text>


                        {/* SALDO INICIAL */}

                        {mostrarSaldoInicial && (

                            <Box
                                mt={6}
                                p={5}
                                bg="gray.50"
                                border="1px solid"
                                borderColor="gray.200"
                                borderRadius="md"
                            >

                                <Text
                                    fontSize="sm"
                                    fontWeight="600"
                                    color="gray.700"
                                    mb={1}
                                >
                                    Primera apertura
                                </Text>

                                <Text
                                    fontSize="sm"
                                    color="gray.500"
                                    mb={4}
                                >
                                    No existe una caja anterior.
                                    Ingresá el efectivo disponible
                                    para comenzar la jornada.
                                </Text>

                                <FormControl>

                                    <FormLabel
                                        fontSize="sm"
                                        fontWeight="600"
                                        color="gray.700"
                                    >
                                        Saldo inicial
                                    </FormLabel>

                                    <InputGroup>

                                        <InputLeftElement
                                            pointerEvents="none"
                                        >

                                            <Icon
                                                as={FiDollarSign}
                                                color="gray.400"
                                            />

                                        </InputLeftElement>

                                        <Input
                                            type="number"
                                            min="0"
                                            placeholder="Ej. 150000"
                                            value={
                                                saldoInicial
                                            }
                                            onChange={(e) =>
                                                setSaldoInicial(
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </InputGroup>

                                </FormControl>

                            </Box>

                        )}


                        {error && (

                            <Text
                                mt={4}
                                fontSize="sm"
                                color="red.500"
                                textAlign="center"
                            >
                                {error}
                            </Text>

                        )}


                        <Button
                            mt={6}
                            w="100%"
                            colorScheme="red"
                            leftIcon={
                                <Icon
                                    as={FiPlus}
                                />
                            }
                            onClick={
                                abrirCaja
                            }
                            isLoading={
                                abriendoCaja
                            }
                            loadingText="Abriendo..."
                        >
                            Abrir caja
                        </Button>

                    </Box>

                </Center>

            </Flex>

        );

    }


    // ========================================
    // DATOS
    // ========================================

    const estaAbierta =
        caja.estado === "ABIERTA" && !modoConsulta;


    const cheques =
        caja.cheques || [];

    const ingresos =
        caja.ingresos || [];

    const egresos =
        caja.egresos || [];

    const egresosBanco =
        caja.egresosBanco || [];

    const retirosAdelantos =
        caja.retirosAdelantos || [];

    const fletes =
        caja.fletes || [];

    const gastosPorBanco =
        caja.gastosPorBanco || [];


    // ========================================
    // COMPONENTE TABLA DE EGRESOS
    // ========================================

    const TablaEgresos = ({
        titulo,
        descripcion,
        datos,
        categoria,
        boton = true,
    }) => {

        const total =
            datos.reduce(
                (suma, item) =>
                    suma +
                    Number(
                        item.importe || 0
                    ),
                0
            );

        return (

            <Box
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                overflow="hidden"
                mb={6}
            >

                <Flex
                    px={6}
                    py={5}
                    align="center"
                    justify="space-between"
                    borderBottom="1px solid"
                    borderColor="gray.100"
                >

                    <Box>

                        <Text
                            fontSize="md"
                            fontWeight="700"
                            color="gray.800"
                        >
                            {titulo}
                        </Text>

                        <Text
                            mt={1}
                            fontSize="sm"
                            color="gray.500"
                        >
                            {descripcion}
                        </Text>

                    </Box>

                    {boton && estaAbierta && (

                        <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => {
                                setEgresoSeleccionado(null);
                                abrirEgreso(
                                    categoria
                                );
                            }}
                        >
                            Agregar
                        </Button>

                    )}

                </Flex>


                {datos.length === 0 ? (

                    <Center
                        py={10}
                        flexDirection="column"
                    >

                        <Text
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.600"
                        >
                            No hay movimientos registrados
                        </Text>

                        <Text
                            mt={1}
                            fontSize="xs"
                            color="gray.400"
                        >
                            Los movimientos que agregues
                            aparecerán aquí.
                        </Text>

                    </Center>

                ) : (

                    <Box
                        overflowX="auto"
                    >

                        <Flex
                            minW="800px"
                            px={6}
                            py={3}
                            bg="gray.50"
                            borderBottom="1px solid"
                            borderColor="gray.200"
                            align="center"
                        >

                            <Box flex={1.5}>
                                <Text
                                    fontSize="xs"
                                    fontWeight="700"
                                    color="gray.500"
                                    textTransform="uppercase"
                                >
                                    Proveedor
                                </Text>
                            </Box>

                            <Box flex={2}>
                                <Text
                                    fontSize="xs"
                                    fontWeight="700"
                                    color="gray.500"
                                    textTransform="uppercase"
                                >
                                    Detalle
                                </Text>
                            </Box>

                            <Box flex={1}>
                                <Text
                                    fontSize="xs"
                                    fontWeight="700"
                                    color="gray.500"
                                    textTransform="uppercase"
                                >
                                    Importe
                                </Text>
                            </Box>

                            <Box w="100px">
                                <Text
                                    fontSize="xs"
                                    fontWeight="700"
                                    color="gray.500"
                                    textTransform="uppercase"
                                >
                                    Acciones
                                </Text>
                            </Box>

                        </Flex>


                        {datos.map(
                            (item) => (

                                <Flex
                                    key={
                                        item._id
                                    }
                                    minW="800px"
                                    px={6}
                                    py={4}
                                    align="center"
                                    borderBottom="1px solid"
                                    borderColor="gray.100"
                                    _hover={{
                                        bg: "gray.50",
                                    }}
                                >

                                    <Box flex={1.5}>

                                        <Text
                                            fontSize="sm"
                                            fontWeight="600"
                                            color="gray.800"
                                        >
                                            {item.proveedor}
                                        </Text>

                                    </Box>

                                    <Box flex={2}>

                                        <Text
                                            fontSize="sm"
                                            color="gray.600"
                                        >
                                            {item.detalle}
                                        </Text>

                                    </Box>

                                    <Box flex={1}>

                                        <Text
                                            fontSize="sm"
                                            fontWeight="700"
                                            color="gray.800"
                                        >
                                            {formatearImporte(
                                                item.importe
                                            )}
                                        </Text>

                                    </Box>

                                    <Box
                                        w="100px"
                                    >

                                        <Flex
                                            gap={1}
                                            justify="flex-end"
                                        >
                                        
                                            {estaAbierta && (
                                            
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="blue"
                                                        onClick={() =>
                                                            editarEgreso(
                                                                item,
                                                                categoria
                                                            )
                                                        }
                                                        title="Editar"
                                                    >
                                                        <Icon
                                                            as={FiEdit}
                                                        />
                                                    </Button>
                                                    
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        colorScheme="red"
                                                        onClick={() =>
                                                            eliminarEgreso(
                                                                item,
                                                                categoria
                                                            )
                                                        }
                                                        title="Eliminar"
                                                    >
                                                        <Icon
                                                            as={FiTrash2}
                                                        />
                                                    </Button>
                                                </>

                                            )}

                                        </Flex>
                                        
                                    </Box>

                                </Flex>

                            )
                        )}


                        <Flex
                            px={6}
                            py={4}
                            justify="flex-end"
                            bg="gray.50"
                        >

                            <Text
                                fontSize="sm"
                                fontWeight="700"
                                color="gray.700"
                            >
                                Total:{" "}
                                {formatearImporte(
                                    total
                                )}
                            </Text>

                        </Flex>

                    </Box>

                )}

            </Box>

        );

    };


    // ========================================
    // RENDER PRINCIPAL
    // ========================================

    return (

        <Flex
            direction="column"
            h="100vh"
            bg="gray.100"
            overflow="hidden"
        >

            {/* ==================================
                CABECERA
            ================================== */}

            <Box
                bg="white"
                borderBottom="1px solid"
                borderColor="gray.200"
                px={8}
                py={6}
            >

                <Flex
                    align="center"
                    justify="space-between"
                >

                    <Box>

                        <Text
                            fontSize="2xl"
                            fontWeight="700"
                            color="gray.800"
                        >
                            {modoConsulta && caja
                                ? `Caja Cerrada — ${formatearFecha(caja.fecha)}`
                                : "Caja"
                            }
                        </Text>

                        <Text
                            mt={1}
                            fontSize="sm"
                            color="gray.500"
                        >
                            Administración de caja diaria
                        </Text>

                    </Box>


                    <Flex align="center" gap={3}>

                    {estaAbierta && !modoConsulta && (
                        <Button
                            colorScheme="red"
                            variant="solid"
                            onClick={cerrarCaja}
                        >
                            Cerrar caja
                        </Button>
                    )}

                    {modoConsulta && onVolver && (
                        <Button
                            leftIcon={<Icon as={FiArrowLeft} />}
                            variant="outline"
                            onClick={onVolver}
                        >
                            Volver a cajas anteriores
                        </Button>
                    )}

                    <Badge
                        colorScheme={
                            estaAbierta
                                ? "green"
                                : "red"
                        }
                        borderRadius="full"
                        px={4}
                        py={2}
                        fontSize="sm"
                    >

                        {estaAbierta
                            ? "Caja abierta"
                            : "Caja cerrada"
                        }

                    </Badge>
                    </Flex>

                </Flex>

            </Box>


            {/* ==================================
                CONTENIDO
            ================================== */}

            <Box
                flex={1}
                overflowY="auto"
                p={8}
            >

                {/* ==================================
                    RESUMEN
                ================================== */}

                <SimpleGrid
                    columns={{
                        base: 1,
                        md: 2,
                        xl: 4,
                    }}
                    spacing={4}
                    mb={6}
                >

                    {/* SALDO INICIAL */}

                    <Box
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        p={5}
                    >

                        <Text
                            fontSize="xs"
                            fontWeight="700"
                            color="gray.500"
                            textTransform="uppercase"
                        >
                            Saldo inicial
                        </Text>

                        <Text
                            mt={2}
                            fontSize="xl"
                            fontWeight="700"
                            color="gray.800"
                        >
                            {formatearImporte(
                                caja.saldoInicial
                            )}
                        </Text>

                    </Box>


                    {/* INGRESOS */}

                    <Box
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        p={5}
                    >

                        <Text
                            fontSize="xs"
                            fontWeight="700"
                            color="gray.500"
                            textTransform="uppercase"
                        >
                            Ingresos
                        </Text>

                        <Text
                            mt={2}
                            fontSize="xl"
                            fontWeight="700"
                            color="gray.800"
                        >
                            {formatearImporte(
                                caja.totalIngresos
                            )}
                        </Text>

                    </Box>


                    {/* CHEQUES */}

                    <Box
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        p={5}
                    >

                        <Text
                            fontSize="xs"
                            fontWeight="700"
                            color="gray.500"
                            textTransform="uppercase"
                        >
                            Cheques
                        </Text>

                        <Text
                            mt={2}
                            fontSize="xl"
                            fontWeight="700"
                            color="gray.800"
                        >
                            {formatearImporte(
                                caja.totalCheques
                            )}
                        </Text>

                    </Box>


                    {/* CAJA CHICA */}

                    <Box
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        p={5}
                    >

                        <Text
                            fontSize="xs"
                            fontWeight="700"
                            color="gray.500"
                            textTransform="uppercase"
                        >
                            Caja chica
                        </Text>

                        <Text
                            mt={2}
                            fontSize="xl"
                            fontWeight="700"
                            color="gray.800"
                        >
                            {formatearImporte(
                                caja.cajaChica
                            )}
                        </Text>

                    </Box>

                </SimpleGrid>


                {/* ==================================
                    INGRESOS
                ================================== */}

                <Box
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    overflow="hidden"
                    mb={6}
                >

                    <Flex
                        px={6}
                        py={5}
                        align="center"
                        justify="space-between"
                        borderBottom="1px solid"
                        borderColor="gray.100"
                    >

                        <Box>

                            <Text
                                fontSize="md"
                                fontWeight="700"
                                color="gray.800"
                            >
                                Ingresos
                            </Text>

                            <Text
                                mt={1}
                                fontSize="sm"
                                color="gray.500"
                            >
                                Ingresos registrados en la caja
                            </Text>

                        </Box>

                        {estaAbierta && (

                            <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => {
                                    setIngresoSeleccionado(null);
                                    modalIngreso.onOpen();
                                }}
                            >
                                Agregar ingreso
                            </Button>

                        )}

                    </Flex>


                    {ingresos.length === 0 ? (

                        <Center
                            py={10}
                            flexDirection="column"
                        >

                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                color="gray.600"
                            >
                                No hay ingresos registrados
                            </Text>

                            <Text
                                mt={1}
                                fontSize="xs"
                                color="gray.400"
                            >
                                Los ingresos que agregues aparecerán aquí.
                            </Text>

                        </Center>

                    ) : (

                        <Box
                            overflowX="auto"
                        >

                            <Flex
                                minW="850px"
                                px={6}
                                py={3}
                                bg="gray.50"
                                borderBottom="1px solid"
                                borderColor="gray.200"
                                align="center"
                            >

                                <Box flex={2}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Cliente
                                    </Text>
                                </Box>

                                <Box flex={1.2}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Contable
                                    </Text>
                                </Box>

                                <Box flex={1}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Importe
                                    </Text>
                                </Box>

                                <Box w="100px">
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Cuenta
                                    </Text>
                                </Box>

                                <Box w="100px">
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Acciones
                                    </Text>
                                </Box>

                            </Flex>


                            {ingresos.map(
                                (ingreso) => (

                                    <Flex
                                        key={
                                            ingreso._id
                                        }
                                        minW="850px"
                                        px={6}
                                        py={4}
                                        align="center"
                                        borderBottom="1px solid"
                                        borderColor="gray.100"
                                        _hover={{
                                            bg: "gray.50",
                                        }}
                                    >

                                        <Box flex={2}>

                                            <Text
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="gray.800"
                                            >
                                                {
                                                    ingreso.cliente
                                                }
                                            </Text>

                                        </Box>


                                        <Box flex={1.2}>

                                            {contableEditandoId === ingreso._id ? (
                                                <Flex direction="row" alignItems={"center"} gap={2}>
                                                    <Input
                                                        type="date"
                                                        size="sm"
                                                        maxW={"130px"}
                                                        value={contableFecha}
                                                        onChange={(e) => setContableFecha(e.target.value)}
                                                        isDisabled={guardandoContableId === ingreso._id}
                                                        aria-label={`Fecha contable de ${ingreso.cliente}`}
                                                    />
                                                    <Flex gap={1}>
                                                        <Button
                                                            size="xs"
                                                            colorScheme="green"
                                                            onClick={() => guardarFechaContable(ingreso)}
                                                            isLoading={guardandoContableId === ingreso._id}
                                                            loadingText="Guardando"
                                                        >
                                                            <Icon as={FiCheck} />
                                                        </Button>
                                                        <Button
                                                            size="xs"
                                                            variant="ghost"
                                                            onClick={cancelarEdicionContable}
                                                            isDisabled={guardandoContableId === ingreso._id}
                                                            aria-label="Cancelar edición de fecha contable"
                                                        >
                                                            <Icon as={FiX} />
                                                        </Button>
                                                    </Flex>
                                                    {errorContable && contableEditandoId === ingreso._id && (
                                                        <Text fontSize="xs" color="red.500">
                                                            {errorContable}
                                                        </Text>
                                                    )}
                                                </Flex>
                                            ) : (
                                                <Flex align="center" gap={2}>
                                                    <Text fontSize="sm" color="gray.600">
                                                        {formatearFecha(ingreso.contable)}
                                                    </Text>
                                                    <Button
                                                        size="xs"
                                                        variant="ghost"
                                                        colorScheme="blue"
                                                        onClick={() => iniciarEdicionContable(ingreso)}
                                                        title="Editar fecha contable"
                                                        aria-label={`Editar fecha contable de ${ingreso.cliente}`}
                                                    >
                                                        <Icon as={FiEdit} />
                                                    </Button>
                                                </Flex>
                                            )}

                                        </Box>


                                        <Box flex={1}>

                                            <Text
                                                fontSize="sm"
                                                fontWeight="700"
                                                color="gray.800"
                                            >
                                                {formatearImporte(
                                                    ingreso.importe
                                                )}
                                            </Text>

                                        </Box>


                                        <Box w="100px">

                                            <Badge
                                                colorScheme={
                                                    ingreso.cuenta === "V"
                                                        ? "green"
                                                        : "blue"
                                                }
                                                borderRadius="full"
                                                px={3}
                                            >
                                                {
                                                    ingreso.cuenta
                                                }
                                            </Badge>

                                        </Box>

                                        <Box
                                            w="100px"
                                        >

                                            <Flex
                                                gap={1}
                                                justify="flex-end"
                                            >
                                            
                                                {estaAbierta && (
                                                
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="blue"
                                                            onClick={() =>
                                                                editarIngreso(
                                                                    ingreso
                                                                )
                                                            }
                                                            title="Editar"
                                                        >
                                                            <Icon
                                                                as={FiEdit}
                                                            />
                                                        </Button>
                                                        
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="red"
                                                            onClick={() =>
                                                                eliminarIngreso(
                                                                    ingreso
                                                                )
                                                            }
                                                            title="Eliminar"
                                                        >
                                                            <Icon
                                                                as={FiTrash2}
                                                            />
                                                        </Button>
                                                    </>

                                                )}

                                            </Flex>
                                            
                                        </Box>

                                    </Flex>

                                )
                            )}


                            <Flex
                                px={6}
                                py={4}
                                justify="flex-end"
                                bg="gray.50"
                            >

                                <Text
                                    fontSize="sm"
                                    fontWeight="700"
                                    color="gray.700"
                                >
                                    Total:{" "}
                                    {formatearImporte(
                                        caja.totalIngresos
                                    )}
                                </Text>

                            </Flex>

                        </Box>

                    )}

                </Box>


                {/* ==================================
                    CHEQUES
                ================================== */}

                <Box
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    overflow="hidden"
                    mb={6}
                >

                    <Flex
                        px={6}
                        py={5}
                        align="center"
                        justify="space-between"
                        borderBottom="1px solid"
                        borderColor="gray.100"
                    >

                        <Box>

                            <Text
                                fontSize="md"
                                fontWeight="700"
                                color="gray.800"
                            >
                                Cheques
                            </Text>

                            <Text
                                mt={1}
                                fontSize="sm"
                                color="gray.500"
                            >
                                Cheques registrados en la caja
                            </Text>

                        </Box>

                        {estaAbierta && (

                            <Button
                                size="sm"
                                colorScheme="red"
                                onClick={
                                    abrirCheque
                                }
                            >
                                Agregar cheque
                            </Button>

                        )}

                    </Flex>


                    {cheques.length === 0 ? (

                        <Center
                            py={10}
                            flexDirection="column"
                        >

                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                color="gray.600"
                            >
                                No hay cheques registrados
                            </Text>

                            <Text
                                mt={1}
                                fontSize="xs"
                                color="gray.400"
                            >
                                Los cheques asociados a la caja aparecerán aquí.
                            </Text>

                        </Center>

                    ) : (

                        <Box overflowX="auto">

                            <Flex
                                minW="1050px"
                                px={6}
                                py={3}
                                bg="gray.50"
                                borderBottom="1px solid"
                                borderColor="gray.200"
                                align="center"
                            >

                                <Box flex={1.5}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Cliente
                                    </Text>
                                </Box>

                                <Box flex={1.5}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Banco
                                    </Text>
                                </Box>

                                <Box flex={1.2}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Número
                                    </Text>
                                </Box>

                                <Box flex={1.2}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Vencimiento
                                    </Text>
                                </Box>

                                <Box flex={1}>
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Importe
                                    </Text>
                                </Box>

                                <Box w="100px">
                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Acciones
                                    </Text>
                                </Box>

                            </Flex>


                            {cheques.map(
                                (item) => {

                                    const cheque =
                                        item.chequeId;

                                    return (

                                        <Flex
                                            key={
                                                item._id
                                            }
                                            minW="950px"
                                            px={6}
                                            py={4}
                                            align="center"
                                            borderBottom="1px solid"
                                            borderColor="gray.100"
                                            _hover={{
                                                bg: "gray.50",
                                            }}
                                        >

                                            <Box flex={1.5}>

                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="600"
                                                    color="gray.800"
                                                >
                                                    {
                                                        cheque?.librador ||
                                                        "-"
                                                    }
                                                </Text>

                                            </Box>


                                            <Box flex={1.5}>

                                                <Text
                                                    fontSize="sm"
                                                    color="gray.600"
                                                >
                                                    {
                                                        cheque?.banco ||
                                                        "-"
                                                    }
                                                </Text>

                                            </Box>


                                            <Box flex={1.2}>

                                                <Text
                                                    fontSize="sm"
                                                    color="gray.600"
                                                >
                                                    {
                                                        cheque?.numero ||
                                                        "-"
                                                    }
                                                </Text>

                                            </Box>


                                            <Box flex={1.2}>

                                                <Text
                                                    fontSize="sm"
                                                    color="gray.600"
                                                >
                                                    {
                                                        formatearFecha(
                                                            cheque?.fechaVencimiento
                                                        )
                                                    }
                                                </Text>

                                            </Box>


                                            <Box flex={1}>

                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="700"
                                                    color="gray.800"
                                                >
                                                    {formatearImporte(
                                                        cheque?.importe
                                                    )}
                                                </Text>

                                            </Box>

                                            <Box
                                                w="100px"
                                            >

                                                <Flex
                                                    gap={1}
                                                    justify="flex-end"
                                                >
                                                
                                                    {estaAbierta &&
                                                        cheque?.estado === "PENDIENTE" && (
                                                        
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="blue"
                                                                onClick={() =>
                                                                    abrirCheque(
                                                                        cheque
                                                                    )
                                                                }
                                                                title="Editar"
                                                            >
                                                                <Icon
                                                                    as={FiEdit}
                                                                />
                                                            </Button>
                                                            
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="red"
                                                                onClick={() =>
                                                                    eliminarCheque(
                                                                        cheque
                                                                    )
                                                                }
                                                                title="Eliminar"
                                                            >
                                                                <Icon
                                                                    as={FiTrash2}
                                                                />
                                                            </Button>
                                                        </>

                                                    )}

                                                </Flex>
                                                
                                            </Box>

                                        </Flex>

                                    );

                                }
                            )}


                            <Flex
                                px={6}
                                py={4}
                                justify="flex-end"
                                bg="gray.50"
                            >

                                <Text
                                    fontSize="sm"
                                    fontWeight="700"
                                    color="gray.700"
                                >
                                    Total:{" "}
                                    {formatearImporte(
                                        caja.totalCheques
                                    )}
                                </Text>

                            </Flex>

                        </Box>

                    )}

                </Box>


                {/* ==================================
                    EGRESOS GENERALES
                ================================== */}

                <TablaEgresos
                    titulo="Egresos"
                    descripcion="Egresos generales registrados en la caja"
                    datos={egresos}
                    categoria="egresos"
                />


                {/* ==================================
                    EGRESOS BANCO
                ================================== */}

                <TablaEgresos
                    titulo="Egresos Banco"
                    descripcion="Egresos registrados contra banco"
                    datos={egresosBanco}
                    categoria="egresosBanco"
                />


                {/* ==================================
                    RETIROS / ADELANTOS
                ================================== */}

                <TablaEgresos
                    titulo="Retiros / Adelantos"
                    descripcion="Retiros y adelantos registrados"
                    datos={retirosAdelantos}
                    categoria="retirosAdelantos"
                />


                {/* ==================================
                    FLETES
                ================================== */}

                <TablaEgresos
                    titulo="Fletes"
                    descripcion="Fletes registrados en la caja"
                    datos={fletes}
                    categoria="fletes"
                />


                {/* ==================================
                    GASTOS POR BANCO
                ================================== */}

                <Box
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    overflow="hidden"
                    mb={6}
                >

                    <Flex
                        px={6}
                        py={5}
                        align="center"
                        justify="space-between"
                        borderBottom="1px solid"
                        borderColor="gray.100"
                    >

                        <Box>

                            <Text
                                fontSize="md"
                                fontWeight="700"
                                color="gray.800"
                            >
                                Gastos por banco
                            </Text>

                            <Text
                                mt={1}
                                fontSize="sm"
                                color="gray.500"
                            >
                                Gastos asociados a movimientos bancarios
                            </Text>

                        </Box>

                        {estaAbierta && (

                            <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => {
                                    setGastoBancoSeleccionado(null);
                                    abrirGastoBanco();
                                }}
                            >
                                Agregar
                            </Button>

                        )}

                    </Flex>


                    {gastosPorBanco.length === 0 ? (

                        <Center
                            py={10}
                            flexDirection="column"
                        >

                            <Text
                                fontSize="sm"
                                fontWeight="600"
                                color="gray.600"
                            >
                                No hay gastos por banco registrados
                            </Text>

                            <Text
                                mt={1}
                                fontSize="xs"
                                color="gray.400"
                            >
                                Los gastos que agregues aparecerán aquí.
                            </Text>

                        </Center>

                    ) : (

                        <Box overflowX="auto">

                            <Flex
                                minW="850px"
                                px={6}
                                py={3}
                                bg="gray.50"
                                borderBottom="1px solid"
                                borderColor="gray.200"
                                align="center"
                            >

                                <Box flex={2}>

                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Detalle
                                    </Text>

                                </Box>

                                <Box flex={1.2}>

                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Medio
                                    </Text>

                                </Box>

                                <Box flex={1}>

                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Total
                                    </Text>

                                </Box>

                                <Box w="100px">

                                    <Text
                                        fontSize="xs"
                                        fontWeight="700"
                                        color="gray.500"
                                        textTransform="uppercase"
                                    >
                                        Acciones
                                    </Text>

                                </Box>

                            </Flex>


                            {gastosPorBanco.map(
                                (gasto) => (

                                    <Flex
                                        key={
                                            gasto._id
                                        }
                                        minW="750px"
                                        px={6}
                                        py={4}
                                        align="center"
                                        borderBottom="1px solid"
                                        borderColor="gray.100"
                                        _hover={{
                                            bg: "gray.50",
                                        }}
                                    >

                                        <Box flex={2}>

                                            <Text
                                                fontSize="sm"
                                                fontWeight="600"
                                                color="gray.800"
                                            >
                                                {
                                                    gasto.detalle
                                                }
                                            </Text>

                                        </Box>


                                        <Box flex={1.2}>

                                            <Badge
                                                colorScheme="blue"
                                                borderRadius="full"
                                                px={3}
                                            >
                                                {
                                                    gasto.medio
                                                }
                                            </Badge>

                                        </Box>


                                        <Box flex={1}>

                                            <Text
                                                fontSize="sm"
                                                fontWeight="700"
                                                color="gray.800"
                                            >
                                                {formatearImporte(
                                                    gasto.total
                                                )}
                                            </Text>

                                        </Box>

                                        <Box
                                            w="100px"
                                        >
                                                                                    
                                            <Flex
                                                gap={1}
                                                justify="flex-end"
                                            >
                                            
                                                {estaAbierta && (
                                                
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="blue"
                                                            onClick={() =>
                                                                editarGastoBanco(
                                                                    gasto
                                                                )
                                                            }
                                                            title="Editar"
                                                        >
                                                            <Icon
                                                                as={FiEdit}
                                                            />
                                                        </Button>
                                                        
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            colorScheme="red"
                                                            onClick={() =>
                                                                eliminarGastoBanco(
                                                                    gasto
                                                                )
                                                            }
                                                            title="Eliminar"
                                                        >
                                                            <Icon
                                                                as={FiTrash2}
                                                            />
                                                        </Button>
                                                    </>
                                        
                                                )}
                                        
                                            </Flex>
                                            
                                        </Box>

                                    </Flex>

                                )
                            )}


                            <Flex
                                px={6}
                                py={4}
                                justify="flex-end"
                                bg="gray.50"
                            >

                                <Text
                                    fontSize="sm"
                                    fontWeight="700"
                                    color="gray.700"
                                >
                                    Total:{" "}
                                    {formatearImporte(
                                        gastosPorBanco.reduce(
                                            (total, item) =>
                                                total +
                                                Number(
                                                    item.total || 0
                                                ),
                                            0
                                        )
                                    )}
                                </Text>

                            </Flex>

                        </Box>

                    )}

                </Box>


                {/* ==================================
                    RESUMEN GENERAL
                ================================== */}

                <Box
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    overflow="hidden"
                    mb={6}
                >

                    <Box
                        px={6}
                        py={5}
                        borderBottom="1px solid"
                        borderColor="gray.100"
                    >

                        <Text
                            fontSize="md"
                            fontWeight="700"
                            color="gray.800"
                        >
                            Resumen de caja
                        </Text>

                    </Box>


                    <Box
                        px={6}
                        py={5}
                    >

                        <SimpleGrid
                            columns={{
                                base: 1,
                                md: 2,
                                xl: 3,
                            }}
                            spacing={6}
                        >

                            <Box>

                                <Text
                                    fontSize="xs"
                                    fontWeight="700"
                                    color="gray.500"
                                    textTransform="uppercase"
                                >
                                    Ingreso manual
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="md"
                                    fontWeight="600"
                                    color="gray.700"
                                >
                                    {formatearImporte(
                                        caja.ingreso
                                    )}
                                </Text>

                            </Box>


                            <Box>

                                <Text
                                    fontSize="xs"
                                    fontWeight="700"
                                    color="gray.500"
                                    textTransform="uppercase"
                                >
                                    Egresos
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="md"
                                    fontWeight="600"
                                    color="gray.700"
                                >
                                    {formatearImporte(
                                        caja.totalEgresosTodos
                                    )}
                                </Text>

                            </Box>


                            <Box>

                                <Text
                                    fontSize="xs"
                                    fontWeight="700"
                                    color="gray.500"
                                    textTransform="uppercase"
                                >
                                    Efectivo disponible
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="md"
                                    fontWeight="600"
                                    color="gray.700"
                                >
                                    {formatearImporte(
                                        caja.efectivo
                                    )}
                                </Text>

                            </Box>


                            <Box>

                                <Text
                                    fontSize="xs"
                                    fontWeight="700"
                                    color="gray.500"
                                    textTransform="uppercase"
                                >
                                    A caja fuerte
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="md"
                                    fontWeight="600"
                                    color="gray.700"
                                >
                                    {formatearImporte(
                                        caja.aCajaFuerte
                                    )}
                                </Text>

                            </Box>


                            <Box>

                                <Text
                                    fontSize="xs"
                                    fontWeight="700"
                                    color="gray.500"
                                    textTransform="uppercase"
                                >
                                    Ingresos V
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="md"
                                    fontWeight="600"
                                    color="gray.700"
                                >
                                    {formatearImporte(
                                        caja.totalIngresosV
                                    )}
                                </Text>

                            </Box>


                            <Box>

                                <Text
                                    fontSize="xs"
                                    fontWeight="700"
                                    color="gray.500"
                                    textTransform="uppercase"
                                >
                                    Ingresos B
                                </Text>

                                <Text
                                    mt={1}
                                    fontSize="md"
                                    fontWeight="600"
                                    color="gray.700"
                                >
                                    {formatearImporte(
                                        caja.totalIngresosB
                                    )}
                                </Text>

                            </Box>

                        </SimpleGrid>

                    </Box>

                </Box>

            </Box>


            {/* ==================================
                MODAL INGRESO
            ================================== */}

            <ModalAgregarIngreso
                isOpen={modalIngreso.isOpen}
                onClose={() => {
                    modalIngreso.onClose();
                    setIngresoSeleccionado(null);
                }}
                caja={caja}
                ingresoEditar={ingresoSeleccionado}
                onAgregado={actualizarCajaDesdeModal}
            />


            {/* ==================================
                MODAL EGRESO
            ================================== */}

           <ModalAgregarEgreso
                isOpen={egresoModalAbierto}
                onClose={() => {
                    setEgresoModalAbierto(false);
                    setEgresoSeleccionado(null);
                }}
                caja={caja}
                categoria={categoriaEgreso}
                egresoEditar={egresoSeleccionado}
                onAgregado={actualizarCajaDesdeModal}
            />


            {/* ==================================
                MODAL GASTO BANCO
            ================================== */}

            <ModalAgregarGastoBanco
                isOpen={gastoBancoModalAbierto}
                onClose={() => {
                    setGastoBancoModalAbierto(false);
                    setGastoBancoSeleccionado(null);
                }}
                caja={caja}
                gastoEditar={gastoBancoSeleccionado}
                onAgregado={actualizarCajaDesdeModal}
            />

            {/* ========================================
                MODAL CHEQUE
            ======================================== */}
            
            <ModalAgregarCheque
                isOpen={chequeModalAbierto}
                onClose={() => {
                    setChequeModalAbierto(false);
                    setChequeSeleccionado(null);
                }}
                caja={caja}
                chequeEditar={chequeSeleccionado}
                onAgregado={actualizarCajaDesdeModal}
            />
            
            {/* ========================================
                CONFIRMACIÓN DE ELIMINACIÓN
            ======================================== */}

            <AlertDialog
                isOpen={Boolean(confirmacion)}
                leastDestructiveRef={cancelarConfirmacionRef}
                onClose={() => setConfirmacion(null)}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent mx={4}>
                        <AlertDialogHeader fontSize="lg" fontWeight="700">
                            Confirmar eliminación
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            {confirmacion?.mensaje}
                        </AlertDialogBody>

                        <AlertDialogFooter gap={3}>
                            <Button
                                ref={cancelarConfirmacionRef}
                                variant="ghost"
                                onClick={() => setConfirmacion(null)}
                            >
                                Cancelar
                            </Button>

                            <Button
                                colorScheme="red"
                                onClick={() => {
                                    const accion = confirmacion?.accion;
                                
                                    setConfirmacion(null);
                                
                                    if (accion) {
                                        accion();
                                    }
                                }}
                            >
                                Eliminar
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

        </Flex>

    );

}