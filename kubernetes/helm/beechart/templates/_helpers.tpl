{{/*
Expand the name of the chart.
*/}}
{{- define "beechart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "beechart.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}

{{- define "beechart.labels" -}}
helm.sh/chart: {{ include "beechart.chart" . }}
{{ include "beechart.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "beechart.selectorLabels" -}}
app.kubernetes.io/name: {{ include "beechart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

