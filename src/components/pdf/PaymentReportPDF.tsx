import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { translatePaymentMethod } from "../../utils/translations";
import dayjs from "dayjs";

interface PaymentReportPDFProps {
  payments: { type: string; total: number; count: number }[];
  start: string;
  end: string;
}

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
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#333",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 20,
  },
  subheader: {
    fontSize: 12,
    marginBottom: 10,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#007BFF",
    color: "white",
    fontWeight: "bold",
  },
  tableCell: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    textAlign: "center",
  },
  footer: {
    textAlign: "right",
    marginTop: 30,
    fontSize: 9,
    color: "#666",
  },
});

export const PaymentReportPDF = ({
  payments,
  start,
  end,
}: PaymentReportPDFProps) => {
  const now = new Date().toLocaleString("es-ES", {
    dateStyle: "short",
    timeStyle: "medium",
  });
  const startDate = dayjs(start).format("DD-MM-YYYY");
  const endDate = dayjs(end).format("DD-MM-YYYY");

  const totalAmount = payments.reduce((sum, p) => sum + p.total, 0);
  const totalCount = payments.reduce((sum, p) => sum + p.count, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Reporte de Pagos</Text>
        <Text style={styles.date}>{now}</Text>

        <Text style={styles.subheader}>Desde: {startDate}</Text>
        <Text style={styles.subheader}>Hasta: {endDate}</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCell}>Tipo de Pago</Text>
            <Text style={styles.tableCell}>Monto Total</Text>
            <Text style={styles.tableCell}>Cantidad</Text>
          </View>

          {payments.map((p, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {translatePaymentMethod(p.type)}
              </Text>
              <Text style={styles.tableCell}>${p.total.toFixed(2)}</Text>
              <Text style={styles.tableCell}>{p.count}</Text>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.tableRow,
            {
              borderTopWidth: 1,
              borderTopColor: "#999",
              backgroundColor: "#f2f2f2",
            },
          ]}
        >
          <Text style={[styles.tableCell, { fontWeight: "bold" }]}>TOTAL</Text>
          <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
            ${totalAmount.toFixed(2)}
          </Text>
          <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
            {totalCount}
          </Text>
        </View>

        <Text style={styles.footer}>Generado: {now}</Text>
      </Page>
    </Document>
  );
};
