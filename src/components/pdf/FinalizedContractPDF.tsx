import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import type { Contract } from "../../api/contract";
import type { Installment } from "../../api/installment";
import { translatePaymentMethod } from "../../utils/translations";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Calibri",
    fontSize: 11,
    paddingTop: 71,
    paddingBottom: 71,
    paddingLeft: 70,
    paddingRight: 70,
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

export const FinalizedContractPDF = ({ contract, installments }: Props) => {
  const name = contract.customerId.firstName.trim().toUpperCase();
  const lastName = contract.customerId.lastName.trim().toUpperCase();
  const documentId = contract.customerId.documentId;
  const startDate =
    contract.startDate?.split("T")[0] ?? dayjs().format("YYYY-MM-DD");
  const description = contract.products.map(
    (p) => `(${p.quantity}) ${p.product.name}`,
  ) || ["Sin productos"];
  const totalPrice = contract.totalPrice;
  const quantityProducts = contract.products.reduce(
    (total, p) => total + p.quantity,
    0,
  );
  const debt = Math.min(
    ...installments
      .map((c) => (c.debt == null ? NaN : Number(c.debt)))
      .filter((d) => !isNaN(d)),
  );

  function calcularPromedioDias(installments: Installment[]) {
    const diferencias = installments
      .map((i) => {
        if (!i.installmentPayments?.length) return null;

        const due = dayjs(i.dueDate);
        const paid = dayjs(i.paidAt);

        return paid.diff(due, "day"); // positivo = tarde, negativo = adelantado
      })
      .filter((d) => d !== null) as number[];

    if (diferencias.length === 0) return 0;

    const suma = diferencias.reduce((a, b) => a + b, 0);
    return Math.round(suma / diferencias.length);
  }

  function clasificarCliente(promedioDias: number) {
    if (promedioDias <= 0) return "EXCELENTE";
    if (promedioDias <= 5) return "BUENO";
    return "DEFICIENTE";
  }

  const promedio = calcularPromedioDias(installments);
  const clasificacion = clasificarCliente(promedio);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* TÍTULO */}
        <Text
          style={{
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          CONSTANCIA DE FINALIZACIÓN DEL CONTRATO C#{contract.code}
        </Text>

        {/* PÁRRAFO */}
        <Text style={{ textAlign: "justify", marginBottom: 15 }}>
          Se deja constancia que el ciudadano{" "}
          <Text style={{ fontWeight: "bold" }}>
            {name} {lastName}
          </Text>{" "}
          titular de la cédula de identidad{" "}
          <Text style={{ fontWeight: "bold" }}>V-{documentId}</Text> ha cumplido
          satisfactoriamente con todas las obligaciones derivadas del contrato
          de compra a crédito, cancelando la totalidad de las cuotas
          establecidas.
          {"\n\n"}
          Del análisis del historial de pagos se concluye que el cliente ha
          mantenido un nivel de cumplimiento
          <Text style={{ fontWeight: "bold" }}> {clasificacion} </Text>
          en el pago de sus cuotas.
        </Text>

        {/* TABLA */}
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
                installments[installments.length - 1].dueDate.split("T")[0],
              ).format("DD-MM-YYYY")}
            </Text>
          </View>
          <View style={[styles.tableRow, styles.header]}>
            <Text style={[styles.tableCol, { width: "10%" }]}>CUOTA</Text>

            <Text
              style={[styles.tableCol, { width: "20%", textAlign: "center" }]}
            >
              FECHA CUOTA
            </Text>

            <Text
              style={[styles.tableCol, { width: "20%", textAlign: "center" }]}
            >
              FECHA PAGO
            </Text>

            <Text
              style={[styles.tableCol, { width: "15%", textAlign: "center" }]}
            >
              MONTO
            </Text>

            <Text
              style={[styles.tableCol, { width: "20%", textAlign: "center" }]}
            >
              TIPO
            </Text>

            <Text
              style={[styles.tableCol, { width: "15%", textAlign: "center" }]}
            >
              SALDO
            </Text>
          </View>

          {installments.map((cuota, index) => {
            return (
              <View style={styles.tableRow} key={index}>
                <Text style={[styles.tableCol, { width: "10%" }]}>
                  #{index + 1}
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
                    { width: "20%", textAlign: "center" },
                  ]}
                >
                  {dayjs(cuota.paidAt!.split("T")[0]).format("DD-MM-YYYY")}
                </Text>
                <Text
                  style={[
                    styles.tableCol,
                    { width: "15%", textAlign: "center" },
                  ]}
                >
                  ${cuota.installmentAmount}
                </Text>
                <Text style={[styles.tableCol, { width: "20%" }]}>
                  {cuota.installmentPayments?.length > 0
                    ? translatePaymentMethod(
                        cuota.installmentPayments[0].payment.type ?? "",
                      )
                    : ""}
                </Text>
                <Text style={[styles.tableCol, { width: "15%" }]}>
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
                  width: "50%",
                },
              ]}
            ></View>
            <View
              style={[
                styles.tableCol,
                {
                  width: "50%",
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

        {/* FIRMA */}
        <View
          style={{
            marginTop: 20,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {SIGNATURE_VENDOR && (
            <Image
              src={SIGNATURE_VENDOR}
              style={{ width: 60, marginBottom: -11 }}
            />
          )}

          <View
            style={{
              borderBottom: "1px solid black",
              width: "30%",
              height: 1,
              marginBottom: 8,
            }}
          />
          <Text style={{ fontWeight: "bold" }}>“EL VENDEDOR”</Text>
        </View>
      </Page>
    </Document>
  );
};
