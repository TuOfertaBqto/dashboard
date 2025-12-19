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
        import.meta.url
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
  const startDate =
    contract.startDate?.split("T")[0] ?? dayjs().format("YYYY-MM-DD");
  const description = contract.products.map(
    (p) => `(${p.quantity}) ${p.product.name}`
  ) || ["Sin productos"];
  const totalPrice = contract.totalPrice;
  const quantityProducts = contract.products.reduce(
    (total, p) => total + p.quantity,
    0
  );
  const documentIdPhoto = contract.customerId.documentIdPhoto;

  const cantidadLetras = numeroALetras(totalPrice).toUpperCase();
  const debt = Math.min(
    ...installments
      .map((c) => (c.debt == null ? NaN : Number(c.debt)))
      .filter((d) => !isNaN(d))
  );

  function fechaEnPalabras(fechaString: string): string {
    const [año, mes, dia] = fechaString.split("-").map(Number);
    const fecha = new Date(año, mes - 1, dia); // mes - 1 porque enero = 0

    const nombreMes = fecha.toLocaleString("es-ES", { month: "long" });
    const mesCapitalizado =
      nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);

    const diaTexto = dia === 1 ? "al primer día" : `a los ${dia} días`;

    return `${diaTexto} del mes de ${mesCapitalizado}, del año ${año}`;
  }

  return (
    <Document>
      {/* Página 1: Párrafo y tabla */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              paddingBottom: 10,
            }}
          >
            CONTRATO DE COMPRA A CRÉDITO PARTES CONTRATANTES
          </Text>
          <Text style={{ textAlign: "justify" }} wrap={false}>
            En la ciudad de Barquisimeto, {fechaEnPalabras(startDate)},
            intervienen a la celebración del presente contrato de afiliación y
            apertura de línea de crédito, para compras bajo el sistema de
            crédito, por una parte, el ciudadano{" "}
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              EIVAR PÉREZ
            </Text>
            , mayor de edad, titular de la cédula de identidad{" "}
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              V-20.010.478
            </Text>
            , domiciliado en Barquisimeto, Edo. Lara, por la interpuesta persona
            del propietario y/o representante legal que suscribe el presente
            contrato, a quien en adelante se le denominará el “EL VENDEDOR” ; y,
            por otra parte, el(la) ciudadano(a){" "}
            <Text style={{ fontWeight: "bold" }}>
              {name} {lastName}
            </Text>
            , venezolano, mayor de edad, titular de la cédula de identidad{" "}
            <Text style={{ fontWeight: "bold" }}>V-{documentId}</Text>{" "}
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              Domiciliado: {address}
            </Text>
            , quien en adelante y para efectos de este contrato se le denominará{" "}
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              “EL CLIENTE”
            </Text>
            , quienes libres y voluntariamente proceden a celebrar el presente
            contrato al tenor de las siguientes cláusulas: PRIMERA: Objeto del
            Contrato{" "}
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              “EL VENDEDOR”
            </Text>{" "}
            se compromete a vender y “EL CLIENTE” a adquirir el/los siguiente(s)
            producto(s): {description.join(", ")}, con seis (6) meses de
            garantía por defectos de fábrica. SEGUNDA: Precio y forma de pago,
            el precio total{" "}
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              {cantidadLetras} DOLARES AMERICANOS {totalPrice} US $
            </Text>
            , a ser pagado por “EL CLIENTE” en installments de acuerdo al
            siguiente calendario:
          </Text>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, { fontWeight: "bold" }]}>
            <Text style={[styles.tableCol, { width: "20%" }]}>CLIENTE</Text>
            <Text
              style={[styles.tableCol, { width: "40%", textAlign: "center" }]}
            >
              {name.split(" ")[0]} {lastName.split(" ")[0]}
            </Text>
            <View
              style={[
                styles.tableCol,
                {
                  width: "40%",
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
              ]}
            >
              <Text>FECHA INICIO:</Text>
              <Text>{dayjs(startDate).format("DD-MM-YYYY")}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View
              style={[
                styles.tableCol,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                },
              ]}
            >
              <Text style={{ width: "80%" }}>{description.join("\n")}</Text>
              <View
                style={{
                  width: "20%",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  fontWeight: "bold",
                }}
              >
                <Text>{quantityProducts} UNID.</Text>
              </View>
            </View>
          </View>

          <View style={[styles.tableRow, { fontWeight: "bold" }]}>
            <Text style={[styles.tableCol, { width: "20%" }]}>MONTO:</Text>
            <Text style={[styles.tableCol, { width: "20%" }]}>
              ${totalPrice}
            </Text>
            <Text style={[styles.tableCol, { width: "40%" }]}>
              FECHA DE CULMINACIÓN:
            </Text>
            <Text style={[styles.tableCol, { width: "20%" }]}>
              {dayjs(
                installments[installments.length - 1].dueDate.split("T")[0]
              ).format("DD-MM-YYYY")}
            </Text>
          </View>
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
                  {translatePaymentMethod(
                    cuota.installmentPayments[0]?.payment.type ?? ""
                  )}
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
      </Page>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={{ textAlign: "justify" }}>
            <Text style={{ fontWeight: "bold" }}>TERCERO: </Text>
            Obligaciones de{" "}
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              “EL CLIENTE”
            </Text>
            ,{" "}
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              “EL CLIENTE”
            </Text>{" "}
            se compromete a realizar los pagos en las fechas establecidas y a
            informar a{" "}
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              “EL VENDEDOR”
            </Text>{" "}
            en caso de cambios de contacto o retrasos justificados.
          </Text>

          <Text style={{ textAlign: "justify", marginTop: 8 }}>
            <Text style={{ fontWeight: "bold" }}>CUARTO: </Text>
            Obligaciones de{" "}
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              “EL VENDEDOR”
            </Text>
            ,{" "}
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              “EL VENDEDOR”
            </Text>{" "}
            garantiza la entrega del producto en buen estado al momento del
            acuerdo y brindará soporte en caso de defectos atribuibles a la
            fabricación.
          </Text>

          <Text style={{ textAlign: "justify", marginTop: 8 }}>
            <Text style={{ fontWeight: "bold" }}>QUINTO: </Text>
            <Text style={{ fontWeight: "bold", fontStyle: "italic" }}>
              Condición Resolutoria por Incumplimiento de Pago y Restitución del
              Bien
            </Text>
            , en caso de que{" "}
            <Text style={{ fontWeight: "bold" }}>“EL CLIENTE” </Text>
            no realice el pago total del precio acordado en la fecha estipulada
            en el calendario de la{" "}
            <Text style={{ fontStyle: "italic" }}>SEGUNDA CLÁUSULA</Text>, se
            entenderá que el presente contrato se resuelve automáticamente, sin
            necesidad de requerimiento judicial o extrajudicial.
          </Text>

          <Text style={{ textAlign: "justify", marginTop: 8 }}>
            <Text style={{ fontWeight: "bold" }}>SEXTO: </Text>
            Obligación de Restitución, como consecuencia de la resolución
            automática del contrato,{" "}
            <Text style={{ fontWeight: "bold" }}>“EL CLIENTE” </Text>
            se obliga voluntariamente a:
          </Text>

          <View style={{ paddingLeft: 20, marginTop: 6 }}>
            <Text>
              1. Entregar inmediatamente el{" "}
              <Text style={{ fontWeight: "bold" }}>“PRODUCTO” </Text>a{" "}
              <Text style={{ fontWeight: "bold" }}>“EL VENDEDOR” </Text>
              en el mismo estado que fue recibido, dentro de los 15 días
              siguientes a la fecha de incumplimiento.
            </Text>

            <Text style={{ marginTop: 4 }}>
              2. Permitir el acceso a{" "}
              <Text style={{ fontWeight: "bold" }}>“EL VENDEDOR” </Text>o a
              quien éste designe para la recuperación del{" "}
              <Text style={{ fontWeight: "bold" }}>“PRODUCTO”</Text>.
            </Text>
          </View>

          <Text style={{ textAlign: "justify", marginTop: 8 }}>
            <Text style={{ fontWeight: "bold" }}>SÉPTIMO: </Text>
            Consecuencias del Incumplimiento de la Restitución, el
            incumplimiento de la obligación de la restitución del{" "}
            <Text style={{ fontWeight: "bold" }}>“PRODUCTO” </Text>
            facultará al{" "}
            <Text style={{ fontWeight: "bold" }}>“EL VENDEDOR” </Text>
            para iniciar las acciones legales correspondientes para su
            recuperación y/o reclamar los daños y perjuicios ocasionados, sin
            perjuicio de la resolución del contrato.
          </Text>

          {/* OCTAVO */}
          <Text style={{ textAlign: "justify", marginTop: 8 }}>
            <Text style={{ fontWeight: "bold" }}>OCTAVO: </Text>
            Aceptación, ambas partes aceptan los términos descritos en este
            contrato, firmando en señal de conformidad.
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 30,
            marginHorizontal: 20,
          }}
        >
          <View style={{ width: "35%", alignItems: "center" }}>
            {SIGNATURE_VENDOR && (
              <Image
                src={SIGNATURE_VENDOR}
                style={{ width: 60, marginBottom: -11 }}
              />
            )}

            <View
              style={{
                borderBottom: "1px solid black",
                width: "100%",
                height: 1,
                marginBottom: 8,
              }}
            />
            <Text style={{ fontWeight: "bold" }}>“EL VENDEDOR”</Text>
          </View>

          <View style={{ width: "35%", alignItems: "center" }}>
            <View style={{ height: 47.6, marginBottom: 4 }} />
            <View
              style={{
                borderBottom: "1px solid black",
                width: "100%",
                height: 1,
                marginBottom: 8,
              }}
            />
            <Text style={{ fontWeight: "bold" }}>“EL CLIENTE”</Text>
          </View>
        </View>
        {documentIdPhoto && (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Image src={documentIdPhoto} style={{ width: 200 }} />
          </View>
        )}
      </Page>
    </Document>
  );
};

export default MyPdfDocument;
