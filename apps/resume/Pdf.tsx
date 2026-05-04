import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { Resume } from '@/lib/content/schema'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#111' },
  h1: { fontSize: 18, fontWeight: 'bold' },
  sub: { fontSize: 11, color: '#444', marginBottom: 12 },
  h2: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 4,
    color: '#333',
    letterSpacing: 0.5,
  },
  role: { marginBottom: 8 },
  roleHead: { flexDirection: 'row', justifyContent: 'space-between' },
  roleTitle: { fontWeight: 'bold', fontSize: 11 },
  roleDates: { fontSize: 9, color: '#666' },
  roleSub: { fontSize: 9, color: '#444', marginBottom: 3 },
  bullet: { flexDirection: 'row', marginBottom: 1, paddingLeft: 8 },
  bulletDot: { width: 8 },
  bulletText: { flex: 1 },
  skillRow: { flexDirection: 'row', marginBottom: 2 },
  skillKey: { width: 120, fontWeight: 'bold' },
  skillVal: { flex: 1 },
})

export function ResumePdf({ resume }: { resume: Resume }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.h1}>Nate O'Farrell</Text>
        <Text style={styles.sub}>
          Director of Infrastructure & Platform Engineering · Tewksbury, MA · nate@nateofarrell.com
        </Text>

        <Text style={styles.h2}>Summary</Text>
        <Text>{resume.summary}</Text>

        <Text style={styles.h2}>Experience</Text>
        {resume.experience.map((role) => (
          <View
            key={`${role.company}-${role.title}-${role.start}`}
            style={styles.role}
            wrap={false}
          >
            <View style={styles.roleHead}>
              <Text style={styles.roleTitle}>{role.title}</Text>
              <Text style={styles.roleDates}>
                {role.start} – {role.end}
              </Text>
            </View>
            <Text style={styles.roleSub}>
              {role.company} · {role.location}
            </Text>
            {role.bullets.map((b) => (
              <View key={b} style={styles.bullet}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>
        ))}

        {resume.certifications.length > 0 ? (
          <>
            <Text style={styles.h2}>Certifications</Text>
            {resume.certifications.map((c) => (
              <Text key={c}>• {c}</Text>
            ))}
          </>
        ) : null}

        <Text style={styles.h2}>Education</Text>
        {resume.education.map((e) => (
          <Text key={e.school}>
            {e.school} — {e.program} ({e.years})
          </Text>
        ))}

        <Text style={styles.h2}>Skills</Text>
        {Object.entries(resume.skills).map(([k, items]) => (
          <View key={k} style={styles.skillRow}>
            <Text style={styles.skillKey}>{k}</Text>
            <Text style={styles.skillVal}>{items.join(', ')}</Text>
          </View>
        ))}
      </Page>
    </Document>
  )
}
