import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Installment } from "../../api/installment";
import type { Contract } from "../../api/contract";
import { numeroALetras } from "../../utils/numero-a-letras";
import { translatePaymentMethod } from "../../utils/translations";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ContractProductApi } from "../../api/contract-product";

Font.registerHyphenationCallback((word) => [word]);

Font.register({
  family: "Calibri",
  fonts: [
    {
      src: new URL("../../../public/fonts/calibri-regular.ttf", import.meta.url)
        .href,
      fontWeight: "normal",
    },
    {
      src: new URL("../../../public/fonts/calibri-bold.ttf", import.meta.url)
        .href,
      fontWeight: "bold",
    },
    {
      src: new URL("../../../public/fonts/calibri-italic.ttf", import.meta.url)
        .href,
      fontStyle: "italic",
    },
    {
      src: new URL(
        "../../../public/fonts/calibri-bold-italic.ttf",
        import.meta.url,
      ).href,
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Calibri",
    fontSize: 11,
    paddingTop: 71,
    paddingBottom: 71,
    paddingLeft: 78,
    paddingRight: 78,
  },
  section: { marginBottom: 10 },
  table: {
    width: "auto",
    maxHeight: 490,
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginLeft: 40,
    marginRight: 40,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  header: {
    fontWeight: "bold",
  },
  image: {
    width: "100%",
    height: 400,
    objectFit: "contain",
  },
  tableInfo: {
    width: "auto",
    maxHeight: 490,
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 15,
  },
  tableCol1: {
    width: "30%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
  tableCol2: {
    width: "70%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 2,
  },
});

interface Props {
  contract: Contract;
  installments: Installment[];
}

const SIGNATURE_VENDOR = import.meta.env.VITE_SIGNATURE_VENDOR;

export const MyPdfDocument = ({ contract, installments }: Props) => {
  const name = contract.customerId.firstName.trim().toUpperCase();
  const lastName = contract.customerId.lastName.trim().toUpperCase();
  const documentId = contract.customerId.documentId;
  const address = contract.customerId.adress;
  const phoneNumber = contract.customerId.phoneNumber;
  const email = contract.customerId.email;
  const agreement =
    contract.agreement === "weekly" ? "semanales" : "quincenales";
  const startDate =
    contract.startDate?.split("T")[0] ?? dayjs().format("YYYY-MM-DD");
  const description = contract.products.map(
    (p) => `(${p.quantity}) ${p.product.name}`,
  ) || ["Sin productos"];
  const totalPrice = contract.totalPrice;
  const documentIdPhoto = contract.customerId.documentIdPhoto;
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const cantidadLetras = numeroALetras(totalPrice).toUpperCase();
  const numberInstallmentsText = numeroALetras(
    installments.length,
  ).toUpperCase();
  const debt = Math.min(
    ...installments
      .map((c) => (c.debt == null ? NaN : Number(c.debt)))
      .filter((d) => !isNaN(d)),
  );

  function fechaEnPalabras(fechaString: string, withYear: boolean): string {
    const [anio, mes, dia] = fechaString.split("-").map(Number);

    const fecha = new Date(anio, mes - 1, dia);
    const mesText = fecha.toLocaleString("es-ES", { month: "long" });

    const nombreMes = mesText.charAt(0).toUpperCase() + mesText.slice(1);

    const diaTexto = numeroALetras(dia);
    const anioTexto = numeroALetras(anio);

    if (dia === 1) {
      if (withYear) {
        return `al primer (1) día del mes de ${nombreMes} del año ${anioTexto} (${anio})`;
      }
      return `al primer (1) día del mes de ${nombreMes} de ${anio}`;
    }

    if (withYear)
      return `a los ${diaTexto} (${dia}) días del mes de ${nombreMes} del año ${anioTexto} (${anio})`;

    return `a los ${diaTexto.toUpperCase()} (${dia}) días del mes de ${nombreMes} de ${anio}`;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ContractProductApi.getAllByContract(contract.id);
        const serials = data.flatMap((item) =>
          item.details.map(
            (detail) =>
              `${detail.serialNumber} - ${detail.isNew ? "Nuevo" : "Reacondicionado"}`,
          ),
        );
        setSerialNumbers(serials);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [contract.id]);

  return (
    <Document style={{ textAlign: "justify" }}>
      <Page size="A4" style={styles.page}>
        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            paddingBottom: 10,
          }}
        >
          CONTRATO DE COMPRAVENTA A CRÉDITO CON RESERVA DE DOMINIO
        </Text>
        <Text style={{ textAlign: "justify", marginBottom: 10 }} wrap={false}>
          En la ciudad de{" "}
          <Text style={{ fontWeight: "bold" }}>Barquisimeto, Estado Lara</Text>,{" "}
          {fechaEnPalabras(startDate, true)}, se celebra el presente Contrato de
          Compraventa a Crédito con Reserva de Dominio, de conformidad con lo
          establecido en el{" "}
          <Text style={{ fontWeight: "bold" }}>Código Civil Venezolano</Text>,
          la{" "}
          <Text style={{ fontWeight: "bold" }}>
            Ley sobre Ventas con Reserva de Dominio
          </Text>
          , la{" "}
          <Text style={{ fontWeight: "bold" }}>
            Ley Orgánica de Precios Justos
          </Text>{" "}
          y demás normas aplicables del ordenamiento jurídico venezolano
          vigente, entre las partes que se identifican a continuación:
        </Text>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginBottom: 10,
          }}
        >
          SECCIÓN I — IDENTIFICACIÓN DE LAS PARTES
        </Text>

        <View>
          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            EL VENDEDOR:
          </Text>

          <View style={styles.tableInfo}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Nombre:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>EIVAR PÉREZ</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Cédula:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>V-20.010.478</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Teléfono/Contacto:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>+58 424 536 38 86</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Correo electrónico:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>eivarperezbox@gmail.com</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Carácter:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>Vendedor</Text>
              </View>
            </View>
          </View>

          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            EL CLIENTE:
          </Text>

          <View style={styles.tableInfo}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Nombre:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>
                  {name} {lastName}
                </Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Cédula:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>V-{documentId}</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Domicilio:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>{address}</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Teléfono/Contacto:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>{phoneNumber}</Text>
              </View>
            </View>

            <View style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text style={{ fontWeight: "bold" }}>Correo electrónico:</Text>
              </View>
              <View style={styles.tableCol2}>
                <Text>{email}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text>
          Ambas partes son venezolanas, mayores de edad, de este domicilio, con
          plena capacidad jurídica para contratar y obligarse, quienes en lo
          sucesivo se denominarán simplemente "EL VENDEDOR" y "EL CLIENTE",
          respectivamente.
        </Text>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA PRIMERA: OBJETO DEL CONTRATO
        </Text>
        <Text>
          EL VENDEDOR se compromete a vender y EL CLIENTE a adquirir a crédito
          el bien mueble descrito a continuación, el cual es de lícito comercio
          y libre de todo gravamen, carga o limitación de dominio a la fecha de
          la firma:
        </Text>

        <View style={styles.tableInfo}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={{ fontWeight: "bold" }}>Descripción:</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text>{description.join("\n")}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={{ fontWeight: "bold" }}>
                Número de serie - Estado:
              </Text>
            </View>
            <View style={styles.tableCol2}>
              <Text>{serialNumbers.join(",\n")}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={{ fontWeight: "bold" }}>Garantía:</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text>Seis (6) meses por defectos de fábrica</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={{ fontWeight: "bold" }}>Precio total:</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text>
                {cantidadLetras} DÓLARES AMERICANOS (USD ${totalPrice})
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={{ fontWeight: "bold" }}>Inicio cuotas:</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text>{dayjs(startDate).format("DD-MM-YYYY")}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol1}>
              <Text style={{ fontWeight: "bold" }}>Última cuota:</Text>
            </View>
            <View style={styles.tableCol2}>
              <Text>
                {dayjs(
                  installments[installments.length - 1].dueDate.split("T")[0],
                ).format("DD-MM-YYYY")}
              </Text>
            </View>
          </View>
        </View>

        <Text>
          El bien objeto del presente contrato será entregado a EL CLIENTE en el
          domicilio del VENDEDOR o en el lugar convenido por ambas partes, al
          momento de la suscripción del presente contrato, previo pago de la
          primera cuota establecida en el calendario de pagos.
        </Text>
      </Page>
      <Page size="A4" style={styles.page}>
        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA SEGUNDA: PRECIO Y FORMA DE PAGO
        </Text>
        <Text style={{ paddingBottom: 10 }}>
          El precio total del bien objeto del presente contrato es la cantidad
          de{" "}
          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            {cantidadLetras} DÓLARES AMERICANOS (USD ${totalPrice})
          </Text>
          , pagadero en{" "}
          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            {numberInstallmentsText} ({installments.length}) cuotas {agreement}
          </Text>
          {/*de CIENTO CINCUENTA DOLARES AMERICANOS (USD $150,00) cada una*/},
          de acuerdo al siguiente calendario de pagos:
        </Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.header]}>
            <View
              style={[
                styles.tableCol,
                {
                  width: "20%",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text>CUOTAS</Text>
            </View>
            <View
              style={[
                styles.tableCol,
                {
                  width: "20%",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text style={{ textAlign: "center" }}>FECHA DE ABONO</Text>
            </View>
            <View
              style={[
                styles.tableCol,
                {
                  width: "15%",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text>MONTO</Text>
            </View>
            <View
              style={[
                styles.tableCol,
                {
                  width: "25%",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text>TIPO DE PAGO</Text>
            </View>
            <View
              style={[
                styles.tableCol,
                {
                  width: "20%",
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Text>SALDO</Text>
            </View>
          </View>

          {installments.map((cuota, index) => {
            return (
              <View style={styles.tableRow} key={index}>
                <Text style={[styles.tableCol, { width: "20%" }]}>
                  CUOTA #{index + 1}
                </Text>
                <Text
                  style={[
                    styles.tableCol,
                    { width: "20%", textAlign: "center" },
                  ]}
                >
                  {dayjs(cuota.dueDate.split("T")[0]).format("DD-MM-YYYY")}
                </Text>
                <Text
                  style={[
                    styles.tableCol,
                    { width: "15%", textAlign: "center" },
                  ]}
                >
                  ${cuota.installmentAmount}
                </Text>
                <Text style={[styles.tableCol, { width: "25%" }]}>
                  {cuota.installmentPayments?.length > 0
                    ? translatePaymentMethod(
                        cuota.installmentPayments[0].payment.type ?? "",
                      )
                    : ""}
                </Text>
                <Text style={[styles.tableCol, { width: "20%" }]}>
                  {cuota.debt ? "$" + cuota.debt : ""}
                </Text>
              </View>
            );
          })}
          <View style={styles.tableRow}>
            <View
              style={[
                styles.tableCol,
                {
                  width: "40%",
                },
              ]}
            ></View>
            <View
              style={[
                styles.tableCol,
                {
                  width: "60%",
                  fontWeight: "bold",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingLeft: 55,
                },
              ]}
            >
              <View>
                <Text>TOTAL DEUDA:</Text>
              </View>
              <View>
                <Text>${debt}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={{ paddingTop: 10 }}>
          Los pagos deberán realizarse mediante transferencia bancaria, pago
          móvil o efectivo en moneda de curso legal o divisas de aceptación
          mutua. Cada pago deberá ser notificado a EL VENDEDOR con el
          comprobante correspondiente. El incumplimiento de dos (2) o más cuotas
          consecutivas o tres (3) alternas facultará a EL VENDEDOR a exigir el
          pago inmediato del saldo total adeudado o resolver el contrato
          conforme a la Cláusula Séptima.
        </Text>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA TERCERA: RESERVA DE DOMINIO
        </Text>
        <Text>
          De conformidad con lo establecido en la Ley sobre Ventas con Reserva
          de Dominio (Gaceta Oficial N° 793 Extraordinario del 18 de agosto de
          1993) y el artículo 1.534 del Código Civil Venezolano, EL VENDEDOR se
          reserva el dominio, la propiedad y la titularidad plena del bien
          descrito en la Cláusula Primera hasta tanto EL CLIENTE haya cancelado
          íntegramente la totalidad del precio pactado, incluyendo cualquier
          monto adicional derivado de mora, penalidades o costos legales.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text>En consecuencia, EL CLIENTE reconoce expresamente que:</Text>

        <View style={{ marginLeft: 20, marginTop: 10 }}>
          {[
            {
              text: "El bien es propiedad exclusiva de EL VENDEDOR hasta el pago total del precio convenido.",
            },
            {
              text: "EL CLIENTE tiene la condición de mero tenedor o poseedor precario del bien, y no de propietario, durante la vigencia de este contrato.",
            },
            {
              text: "El simple transcurso del tiempo o el uso del bien NO transfiere la propiedad a EL CLIENTE.",
            },
            {
              text: "La propiedad del bien solo se transferirá a EL CLIENTE mediante la cancelación total del precio y la entrega de un documento de finiquito suscrito por EL VENDEDOR.",
            },
          ].map((item, index) => (
            <View key={index} style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>3.{index + 1}. </Text>
              <Text style={{ flex: 1 }}>{item.text}</Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA CUARTA: PROHIBICIÓN DE ENAJENACIÓN, GRAVAMEN Y DISPOSICIÓN
        </Text>
        <Text>
          Siendo que EL VENDEDOR conserva la propiedad del bien durante la
          vigencia del presente contrato, EL CLIENTE queda EXPRESAMENTE
          PROHIBIDO de realizar cualquiera de los siguientes actos sin el
          consentimiento previo, expreso y por escrito de EL VENDEDOR:
        </Text>

        <View style={{ marginLeft: 20, marginTop: 10 }}>
          {[
            {
              text: "Vender, ceder, traspasar, donar o de cualquier forma transferir el bien a terceros, sea a título oneroso o gratuito.",
            },
            {
              text: "Empeñar, hipotecar, dar en prenda, constituir garantías reales o cualquier otro gravamen sobre el bien.",
            },
            {
              text: "Dar el bien en comodato, depósito o cualquier otra forma de cesión de uso o tenencia a terceros.",
            },
            {
              text: "Modificar, alterar, desarmar o desincorporar partes o componentes del bien que afecten su funcionalidad, valor o identificación.",
            },
            {
              text: "Sacar el bien del territorio de la República Bolivariana de Venezuela sin autorización previa de EL VENDEDOR.",
            },
          ].map((item, index) => (
            <View key={index} style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>4.{index + 1}. </Text>
              <Text style={{ flex: 1 }}>{item.text}</Text>
            </View>
          ))}
        </View>

        <Text>
          El incumplimiento de cualquiera de las prohibiciones establecidas en
          esta cláusula será considerado una falta grave que generará la
          resolución automática e inmediata del contrato, sin perjuicio de las
          acciones civiles y/o penales que correspondan, incluyendo la denuncia
          por el delito de disposición de cosa empeñada tipificado en el
          ordenamiento jurídico venezolano.
        </Text>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA QUINTA: OBLIGACIONES DE EL CLIENTE
        </Text>
        <Text>EL CLIENTE se obliga expresamente a:</Text>

        <View style={{ marginLeft: 20, marginTop: 10 }}>
          {[
            {
              text: "Cancelar puntualmente cada cuota en la fecha establecida en el calendario de pagos de la Cláusula Segunda.",
            },
            {
              text: "Conservar el bien en buen estado, realizando el mantenimiento ordinario que corresponda y respondiendo por cualquier daño o deterioro causado por negligencia, dolo o mal uso.",
            },
            {
              text: "Notificar a EL VENDEDOR, con un mínimo de cuarenta y ocho (48) horas de anticipación, sobre cualquier imposibilidad justificada de cumplir con un pago en la fecha prevista.",
            },
            {
              text: "Informar a EL VENDEDOR, dentro de las veinticuatro (24) horas siguientes, sobre cualquier cambio en su domicilio, número de contacto o datos de comunicación.",
            },
            {
              text: "Permitir a EL VENDEDOR verificar razonablemente el estado y ubicación del bien, previa notificación.",
            },
            {
              text: "No alterar ni remover el número de serie o cualquier otro elemento de identificación del bien.",
            },
            {
              text: "Responder por los daños causados al bien por siniestros ocurridos durante su tenencia, salvo caso fortuito o fuerza mayor debidamente comprobados.",
            },
          ].map((item, index) => (
            <View key={index} style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>5.{index + 1}. </Text>
              <Text style={{ flex: 1 }}>{item.text}</Text>
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
          }}
        >
          CLÁUSULA SEXTA: OBLIGACIONES DE EL VENDEDOR
        </Text>
        <Text>EL VENDEDOR se obliga expresamente a:</Text>

        <View style={{ marginLeft: 20, marginTop: 10 }}>
          {[
            {
              text: "Entregar el bien en perfectas condiciones de funcionamiento al momento de la firma del contrato y pago de la primera cuota.",
            },
            {
              text: "Otorgar garantía de seis (6) meses por defectos de fabricación, contados desde la fecha de entrega.",
            },
            {
              text: "Emitir y entregar recibo o comprobante de pago por cada cuota cancelada por EL CLIENTE.",
            },
            {
              text: "Notificar a EL CLIENTE, con al menos cuarenta y ocho (48) horas de anticipación, cualquier circunstancia que pueda afectar las condiciones del contrato.",
            },
            {
              text: "Otorgar documento de finiquito y transferencia de propiedad a EL CLIENTE una vez cancelado el precio total del bien.",
            },
            {
              text: "Mantener la confidencialidad de los datos personales de EL CLIENTE, de conformidad con la legislación venezolana aplicable.",
            },
          ].map((item, index) => (
            <View key={index} style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>6.{index + 1}. </Text>
              <Text style={{ flex: 1 }}>{item.text}</Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA SÉPTIMA: MORA, INTERESES Y PENALIDADES
        </Text>
        <Text>
          En caso de que EL CLIENTE incurra en mora en el pago de cualquier
          cuota, se aplicarán las siguientes consecuencias:
        </Text>

        <View style={{ marginLeft: 20, marginTop: 10 }}>
          {[
            {
              text: "Se generará un recargo por mora del uno por ciento (1%) mensual sobre el monto de la cuota vencida, calculado por cada semana o fracción de semana de retraso, de conformidad con lo establecido en el Código Civil Venezolano y Codigo de Comercio Venezolano.",
            },
            {
              text: "El incumplimiento de dos (2) cuotas consecutivas o tres (3) alternas facultará a EL VENDEDOR, a su sola elección, a: (a) exigir el pago inmediato de la totalidad del saldo adeudado, incluyendo recargos e intereses; o (b) resolver el contrato conforme a la Cláusula Octava.",
            },
            {
              text: "Los pagos realizados con posterioridad al vencimiento serán imputados primero a los intereses moratorios causados y luego al capital adeudado.",
            },
          ].map((item, index) => (
            <View key={index} style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>7.{index + 1}. </Text>
              <Text style={{ flex: 1 }}>{item.text}</Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA OCTAVA: RESOLUCIÓN DEL CONTRATO Y RESTITUCIÓN DEL BIEN
        </Text>
        <Text>
          El presente contrato podrá resolverse en los siguientes supuestos:
        </Text>

        <View style={{ marginLeft: 20, marginTop: 10 }}>
          {[
            {
              text: "Por incumplimiento de EL CLIENTE en el pago de dos (2) cuotas consecutivas o tres (3) alternas, conforme a lo previsto en la Ley sobre Ventas con Reserva de Dominio.",
            },
            {
              text: "Por violación de cualquiera de las prohibiciones establecidas en la Cláusula Cuarta del presente contrato.",
            },
            {
              text: "Por incumplimiento grave de cualquier otra obligación esencial asumida en este instrumento.",
            },
          ].map((item, index) => (
            <View key={index} style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>8.{index + 1}. </Text>
              <Text style={{ flex: 1 }}>{item.text}</Text>
            </View>
          ))}
        </View>
        <Text>
          Declarada o producida la resolución del contrato, EL CLIENTE se obliga
          a:
        </Text>

        <View style={{ marginLeft: 20, marginTop: 10 }}>
          {[
            {
              text: "Entregar inmediatamente el bien a EL VENDEDOR, en el mismo estado en que fue recibido, salvo el deterioro normal por el uso, dentro de los quince (15) días continuos siguientes a la fecha de resolución.",
            },
            {
              text: "Permitir el acceso de EL VENDEDOR, o de quien éste designe mediante comunicación escrita, para la recuperación del bien en el domicilio indicado en este contrato.",
            },
          ].map((item, index) => (
            <View key={index} style={{ flexDirection: "row", marginBottom: 5 }}>
              <Text style={{ fontWeight: "bold" }}>8.{index + 4}. </Text>
              <Text style={{ flex: 1 }}>{item.text}</Text>
            </View>
          ))}
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text>
          Las cuotas pagadas hasta la fecha de resolución quedarán en beneficio
          de EL VENDEDOR como indemnización por el uso del bien y los perjuicios
          ocasionados por el incumplimiento, sin perjuicio de la responsabilidad
          por daños adicionales que pudieran determinarse. En caso de que EL
          CLIENTE no entregue el bien voluntariamente en el plazo señalado, EL
          VENDEDOR podrá ejercer las acciones legales pertinentes ante los
          tribunales competentes.
        </Text>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA NOVENA: CASO FORTUITO Y FUERZA MAYOR
        </Text>
        <Text>
          En caso de pérdida, robo, daño total o destrucción del bien por causa
          no imputable a EL CLIENTE, este deberá notificar a EL VENDEDOR dentro
          de las veinticuatro (24) horas siguientes al hecho, presentando la
          denuncia ante las autoridades competentes cuando corresponda. Esta
          circunstancia no exime a EL CLIENTE de la obligación de pagar el saldo
          adeudado hasta la fecha del siniestro, y las partes deberán acordar de
          buena fe las condiciones para el pago del saldo restante o la
          sustitución del bien.
        </Text>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA DÉCIMA: NOTIFICACIONES
        </Text>
        <Text>
          Toda notificación, comunicación o requerimiento derivado del presente
          contrato deberá realizarse por escrito y se tendrá por válidamente
          efectuada cuando sea entregada personalmente con acuse de recibo,
          enviada por mensaje de texto o aplicación de mensajería instantánea
          (WhatsApp u otra) al número de contacto indicado en el presente
          contrato, o mediante cualquier otro medio que deje constancia
          fehaciente de su recepción. Las partes se comprometen a mantener
          actualizados sus datos de contacto y a notificar cualquier cambio en
          el plazo establecido en la Cláusula Quinta.
        </Text>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA DÉCIMA PRIMERA: PROTECCIÓN DE DATOS PERSONALES
        </Text>
        <Text>
          Los datos personales suministrados por EL CLIENTE en este contrato
          serán utilizados exclusivamente para la gestión y ejecución del mismo.
          EL VENDEDOR se compromete a no ceder, vender ni transferir dicha
          información a terceros sin el consentimiento expreso de EL CLIENTE,
          salvo requerimiento de autoridad competente, de conformidad con las
          disposiciones legales venezolanas aplicables en materia de protección
          de datos.
        </Text>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA DÉCIMA SEGUNDA: DOMICILIO PROCESAL Y JURISDICCIÓN
        </Text>
        <Text>
          Para todos los efectos legales y judiciales derivados del presente
          contrato, las partes establecen como domicilio procesal especial la
          ciudad de Barquisimeto, Estado Lara, y someten expresamente cualquier
          controversia a la jurisdicción de los Tribunales competentes de dicha
          ciudad, con renuncia expresa a cualquier otro fuero o jurisdicción que
          pudiera corresponderles. Lo anterior sin perjuicio de la posibilidad
          de acudir a la mediación o conciliación extrajudicial como mecanismo
          previo de resolución de conflictos.
        </Text>

        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
            marginTop: 10,
          }}
        >
          CLÁUSULA DÉCIMA TERCERA: INTERPRETACIÓN E INTEGRACIÓN
        </Text>
        <Text>
          El presente contrato representa la totalidad del acuerdo entre las
          partes con respecto al objeto aquí descrito y deja sin efecto
          cualquier negociación, acuerdo verbal o escrito anterior. Cualquier
          modificación, adición o enmienda a este contrato deberá constar por
          escrito y ser suscrita por ambas partes para tener validez. En caso de
          contradicción entre las cláusulas del presente instrumento, se
          preferirá la interpretación que mejor proteja el equilibrio de los
          derechos y obligaciones de ambas partes, de conformidad con los
          principios generales del derecho venezolano.
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text
          style={{
            fontWeight: "bold",
            textDecoration: "underline",
          }}
        >
          CLÁUSULA DÉCIMA CUARTA: ACEPTACIÓN Y CONSENTIMIENTO
        </Text>
        <Text>
          Ambas partes declaran haber leído, comprendido y aceptado íntegramente
          el contenido del presente contrato, el cual es suscrito libre y
          voluntariamente, sin coacción, dolo, error ni ningún otro vicio del
          consentimiento, redactado y aprobado por consultoria juridica, en en
          señal de plena conformidad con todas y cada una de sus cláusulas.
        </Text>
        <Text
          style={{
            marginVertical: 10,
          }}
        >
          Firmado en Barquisimeto, Estado Lara,{" "}
          {fechaEnPalabras(startDate, false)}.
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 50,
            marginHorizontal: 20,
          }}
        >
          <View
            style={{ width: "45%", alignItems: "center", position: "relative" }}
          >
            <Text
              style={{
                position: "absolute",
                left: 0,
                top: 0,
              }}
            >
              Firma:
            </Text>

            <View
              style={{
                height: 60,
                justifyContent: "flex-end",
                marginBottom: 5,
                width: "100%",
                alignItems: "center",
              }}
            >
              {SIGNATURE_VENDOR && (
                <Image
                  src={SIGNATURE_VENDOR}
                  style={{ width: 150, height: "auto", marginBottom: -10 }}
                />
              )}
            </View>

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "black",
                borderBottomStyle: "solid",
                width: "85%",
                marginBottom: 8,
              }}
            />

            <Text style={{ textAlign: "center" }}>Eivar Perez</Text>
            <Text style={{ textAlign: "center" }}>C.I.: V-20.010.478</Text>
            <Text
              style={{
                fontWeight: "bold",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              “EL VENDEDOR”
            </Text>
          </View>

          <View
            style={{ width: "45%", alignItems: "center", position: "relative" }}
          >
            <Text
              style={{
                position: "absolute",
                left: 0,
                top: 0,
              }}
            >
              Firma:
            </Text>

            <View
              style={{
                height: 60,
                justifyContent: "flex-end",
                marginBottom: 5,
                width: "100%",
                alignItems: "center",
              }}
            ></View>

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: "black",
                borderBottomStyle: "solid",
                width: "85%",
                marginBottom: 8,
              }}
            />

            <Text style={{ textAlign: "center" }}>
              {name.split(" ")[0]} {lastName.split(" ")[0]}
            </Text>
            <Text style={{ textAlign: "center" }}>C.I.: V-{documentId}</Text>
            <Text
              style={{
                fontWeight: "bold",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              “EL CLIENTE”
            </Text>
          </View>
        </View>

        {documentIdPhoto && (
          <View style={{ alignItems: "center", marginTop: 30 }}>
            <Image src={documentIdPhoto} style={{ width: 200 }} />
          </View>
        )}

        <Text style={{ fontSize: 10, color: "#555", marginTop: 30 }}>
          <Text
            style={{
              fontWeight: "bold",
            }}
          >
            NOTA LEGAL:
          </Text>{" "}
          Este contrato se rige por el Código Civil Venezolano, la Ley sobre
          Ventas con Reserva de Dominio (G.O. N° 793 Ext. del 18/08/1993), la
          Ley Orgánica de Precios Justos y demás normas aplicables. Se
          recomienda su registro ante la Notaría Pública correspondiente para
          mayor oponibilidad frente a terceros.
        </Text>
      </Page>
    </Document>
  );
};

export default MyPdfDocument;
