package models

import (
	"fmt"
	"strings"

	"pentagi/cmd/installer/loader"
	"pentagi/cmd/installer/wizard/controller"
	"pentagi/cmd/installer/wizard/locale"
	"pentagi/cmd/installer/wizard/logger"
	"pentagi/cmd/installer/wizard/styles"
	"pentagi/cmd/installer/wizard/window"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

const (
	NoopTraceBaseURLPlaceholder       = "https://cloud.nooptrace.com"
	NoopTraceProjectIDPlaceholder     = "cm000000000000000000000000"
	NoopTracePublicKeyPlaceholder     = "pk-lf-00000000-0000-0000-0000-000000000000"
	NoopTraceSecretKeyPlaceholder     = ""
	NoopTraceAdminEmailPlaceholder    = "admin@pentagi.com"
	NoopTraceAdminPasswordPlaceholder = ""
	NoopTraceAdminNamePlaceholder     = "admin"
	NoopTraceLicenseKeyPlaceholder    = "sk-lf-ee-xxxxxxxxxxxxxxxxxxxxxxxx"
)

// NoopTraceFormModel represents the NoopTrace configuration form
type NoopTraceFormModel struct {
	*BaseScreen

	// screen-specific components
	deploymentList     list.Model
	deploymentDelegate *BaseListDelegate
}

// NewNoopTraceFormModel creates a new NoopTrace form model
func NewNoopTraceFormModel(c controller.Controller, s styles.Styles, w window.Window) *NoopTraceFormModel {
	m := &NoopTraceFormModel{}

	m.BaseScreen = NewBaseScreen(c, s, w, m, m)
	m.initializeDeploymentList(s)

	return m
}

// initializeDeploymentList sets up the deployment type selection list
func (m *NoopTraceFormModel) initializeDeploymentList(styles styles.Styles) {
	options := []BaseListOption{
		{Value: "embedded", Display: locale.MonitoringNoopTraceEmbedded},
		{Value: "external", Display: locale.MonitoringNoopTraceExternal},
		{Value: "disabled", Display: locale.MonitoringNoopTraceDisabled},
	}

	m.deploymentDelegate = NewBaseListDelegate(
		styles.FormLabel.Align(lipgloss.Center),
		MinMenuWidth-6,
	)

	m.deploymentList = m.GetListHelper().CreateList(options, m.deploymentDelegate, MinMenuWidth-6, 3)

	config := m.GetController().GetNoopTraceConfig()

	m.GetListHelper().SelectByValue(&m.deploymentList, config.DeploymentType)
}

// getSelectedDeploymentType returns the currently selected deployment type using the helper
func (m *NoopTraceFormModel) getSelectedDeploymentType() string {
	selectedValue := m.GetListHelper().GetSelectedValue(&m.deploymentList)
	if selectedValue == "" {
		return "disabled"
	}

	return selectedValue
}

// BaseScreenHandler interface implementation

func (m *NoopTraceFormModel) BuildForm() tea.Cmd {
	config := m.GetController().GetNoopTraceConfig()
	fields := []FormField{}
	deploymentType := m.getSelectedDeploymentType()

	switch deploymentType {
	case "embedded":
		// Embedded mode - requires all fields including admin credentials
		fields = append(fields, m.createTextField(config, "listen_ip",
			locale.MonitoringNoopTraceListenIP, locale.MonitoringNoopTraceListenIPDesc, false, "",
		))
		fields = append(fields, m.createTextField(config, "listen_port",
			locale.MonitoringNoopTraceListenPort, locale.MonitoringNoopTraceListenPortDesc, false, "",
		))
		fields = append(fields, m.createTextField(config, "project_id",
			locale.MonitoringNoopTraceProjectID, locale.MonitoringNoopTraceProjectIDDesc, false, NoopTraceProjectIDPlaceholder,
		))
		fields = append(fields, m.createTextField(config, "public_key",
			locale.MonitoringNoopTracePublicKey, locale.MonitoringNoopTracePublicKeyDesc, true, NoopTracePublicKeyPlaceholder,
		))
		fields = append(fields, m.createTextField(config, "secret_key",
			locale.MonitoringNoopTraceSecretKey, locale.MonitoringNoopTraceSecretKeyDesc, true, NoopTraceSecretKeyPlaceholder,
		))
		if !config.Installed {
			fields = append(fields, m.createTextField(config, "admin_email",
				locale.MonitoringNoopTraceAdminEmail, locale.MonitoringNoopTraceAdminEmailDesc, false, NoopTraceAdminEmailPlaceholder,
			))
			fields = append(fields, m.createTextField(config, "admin_password",
				locale.MonitoringNoopTraceAdminPassword, locale.MonitoringNoopTraceAdminPasswordDesc, true, NoopTraceAdminPasswordPlaceholder,
			))
			fields = append(fields, m.createTextField(config, "admin_name",
				locale.MonitoringNoopTraceAdminName, locale.MonitoringNoopTraceAdminNameDesc, false, NoopTraceAdminNamePlaceholder,
			))
		}
		fields = append(fields, m.createTextField(config, "license_key",
			locale.MonitoringNoopTraceLicenseKey, locale.MonitoringNoopTraceLicenseKeyDesc, true, NoopTraceLicenseKeyPlaceholder,
		))

	case "external":
		// External mode - requires connection details only
		fields = append(fields, m.createTextField(config, "base_url",
			locale.MonitoringNoopTraceBaseURL, locale.MonitoringNoopTraceBaseURLDesc, false, NoopTraceBaseURLPlaceholder,
		))
		fields = append(fields, m.createTextField(config, "project_id",
			locale.MonitoringNoopTraceProjectID, locale.MonitoringNoopTraceProjectIDDesc, false, NoopTraceProjectIDPlaceholder,
		))
		fields = append(fields, m.createTextField(config, "public_key",
			locale.MonitoringNoopTracePublicKey, locale.MonitoringNoopTracePublicKeyDesc, true, NoopTracePublicKeyPlaceholder,
		))
		fields = append(fields, m.createTextField(config, "secret_key",
			locale.MonitoringNoopTraceSecretKey, locale.MonitoringNoopTraceSecretKeyDesc, true, NoopTraceSecretKeyPlaceholder,
		))

	case "disabled":
		// Disabled mode has no additional fields
	}

	m.SetFormFields(fields)
	return nil
}

func (m *NoopTraceFormModel) createTextField(
	config *controller.NoopTraceConfig, key, title, description string, masked bool, placeholder string,
) FormField {
	var envVar loader.EnvVar
	switch key {
	case "listen_ip":
		envVar = config.ListenIP
	case "listen_port":
		envVar = config.ListenPort
	case "base_url":
		envVar = config.BaseURL
	case "project_id":
		envVar = config.ProjectID
	case "public_key":
		envVar = config.PublicKey
	case "secret_key":
		envVar = config.SecretKey
	case "admin_email":
		envVar = config.AdminEmail
	case "admin_password":
		envVar = config.AdminPassword
	case "admin_name":
		envVar = config.AdminName
	case "license_key":
		envVar = config.LicenseKey
	}

	input := NewTextInput(m.GetStyles(), m.GetWindow(), envVar)
	if placeholder != "" {
		input.Placeholder = placeholder
	}

	return FormField{
		Key:         key,
		Title:       title,
		Description: description,
		Required:    false,
		Masked:      masked,
		Input:       input,
		Value:       input.Value(),
	}
}

func (m *NoopTraceFormModel) GetFormTitle() string {
	return locale.MonitoringNoopTraceFormTitle
}

func (m *NoopTraceFormModel) GetFormDescription() string {
	return locale.MonitoringNoopTraceFormDescription
}

func (m *NoopTraceFormModel) GetFormName() string {
	return locale.MonitoringNoopTraceFormName
}

func (m *NoopTraceFormModel) GetFormSummary() string {
	return ""
}

func (m *NoopTraceFormModel) GetFormOverview() string {
	var sections []string

	sections = append(sections, m.GetStyles().Subtitle.Render(locale.MonitoringNoopTraceFormTitle))
	sections = append(sections, "")
	sections = append(sections, m.GetStyles().Paragraph.Bold(true).Render(locale.MonitoringNoopTraceFormDescription))
	sections = append(sections, "")
	sections = append(sections, m.GetStyles().Paragraph.Render(locale.MonitoringNoopTraceFormOverview))

	return strings.Join(sections, "\n")
}

func (m *NoopTraceFormModel) GetCurrentConfiguration() string {
	var sections []string

	sections = append(sections, m.GetStyles().Subtitle.Render(m.GetFormName()))

	config := m.GetController().GetNoopTraceConfig()

	getMaskedValue := func(value string) string {
		maskedValue := strings.Repeat("*", len(value))
		if len(value) > 15 {
			maskedValue = maskedValue[:15] + "..."
		}
		return maskedValue
	}

	switch config.DeploymentType {
	case "embedded":
		sections = append(sections, "• "+locale.UIMode+m.GetStyles().Success.Render(locale.MonitoringNoopTraceEmbedded))
		if listenIP := config.ListenIP.Value; listenIP != "" {
			listenIP = m.GetStyles().Info.Render(listenIP)
			sections = append(sections, fmt.Sprintf("• %s: %s", locale.MonitoringNoopTraceListenIP, listenIP))
		} else if listenIP := config.ListenIP.Default; listenIP != "" {
			listenIP = m.GetStyles().Muted.Render(listenIP)
			sections = append(sections, fmt.Sprintf("• %s: %s", locale.MonitoringNoopTraceListenIP, listenIP))
		}

		if listenPort := config.ListenPort.Value; listenPort != "" {
			listenPort = m.GetStyles().Info.Render(listenPort)
			sections = append(sections, fmt.Sprintf("• %s: %s", locale.MonitoringNoopTraceListenPort, listenPort))
		} else if listenPort := config.ListenPort.Default; listenPort != "" {
			listenPort = m.GetStyles().Muted.Render(listenPort)
			sections = append(sections, fmt.Sprintf("• %s: %s", locale.MonitoringNoopTraceListenPort, listenPort))
		}
		if config.BaseURL.Value != "" {
			sections = append(sections, fmt.Sprintf("• %s: %s",
				locale.MonitoringNoopTraceBaseURL, m.GetStyles().Info.Render(config.BaseURL.Value)))
		}
		if config.ProjectID.Value != "" {
			sections = append(sections, fmt.Sprintf("• %s: %s",
				locale.MonitoringNoopTraceProjectID, m.GetStyles().Info.Render(config.ProjectID.Value)))
		}
		if publicKey := config.PublicKey.Value; publicKey != "" {
			sections = append(sections, fmt.Sprintf("• %s: %s",
				locale.MonitoringNoopTracePublicKey, m.GetStyles().Muted.Render(getMaskedValue(publicKey))))
		}
		if secretKey := config.SecretKey.Value; secretKey != "" {
			sections = append(sections, fmt.Sprintf("• %s: %s",
				locale.MonitoringNoopTraceSecretKey, m.GetStyles().Muted.Render(getMaskedValue(secretKey))))
		}
		if config.AdminEmail.Value != "" {
			sections = append(sections, fmt.Sprintf("• %s: %s",
				locale.MonitoringNoopTraceAdminEmail, m.GetStyles().Info.Render(config.AdminEmail.Value)))
		}
		if adminPassword := config.AdminPassword.Value; adminPassword != "" {
			sections = append(sections, fmt.Sprintf("• %s: %s",
				locale.MonitoringNoopTraceAdminPassword, m.GetStyles().Muted.Render(getMaskedValue(adminPassword))))
		}
		if config.AdminName.Value != "" {
			sections = append(sections, fmt.Sprintf("• %s: %s",
				locale.MonitoringNoopTraceAdminName, m.GetStyles().Info.Render(config.AdminName.Value)))
		}

	case "external":
		sections = append(sections, "• "+locale.UIMode+m.GetStyles().Success.Render(locale.MonitoringNoopTraceExternal))
		if config.BaseURL.Value != "" {
			sections = append(sections, fmt.Sprintf("• %s: %s",
				locale.MonitoringNoopTraceBaseURL, m.GetStyles().Info.Render(config.BaseURL.Value)))
		}
		if config.ProjectID.Value != "" {
			sections = append(sections, fmt.Sprintf("• %s: %s",
				locale.MonitoringNoopTraceProjectID, m.GetStyles().Info.Render(config.ProjectID.Value)))
		}
		if publicKey := config.PublicKey.Value; publicKey != "" {
			sections = append(sections, fmt.Sprintf("• %s: %s",
				locale.MonitoringNoopTracePublicKey, m.GetStyles().Muted.Render(getMaskedValue(publicKey))))
		}
		if secretKey := config.SecretKey.Value; secretKey != "" {
			sections = append(sections, fmt.Sprintf("• %s: %s",
				locale.MonitoringNoopTraceSecretKey, m.GetStyles().Muted.Render(getMaskedValue(secretKey))))
		}

	case "disabled":
		sections = append(sections, "• "+locale.UIMode+m.GetStyles().Warning.Render(locale.MonitoringNoopTraceDisabled))
	}

	return strings.Join(sections, "\n")
}

func (m *NoopTraceFormModel) IsConfigured() bool {
	config := m.GetController().GetNoopTraceConfig()
	return config.DeploymentType != "disabled"
}

func (m *NoopTraceFormModel) GetHelpContent() string {
	var sections []string
	deploymentType := m.getSelectedDeploymentType()

	sections = append(sections, m.GetStyles().Subtitle.Render(locale.MonitoringNoopTraceFormTitle))
	sections = append(sections, "")
	sections = append(sections, locale.MonitoringNoopTraceModeGuide)
	sections = append(sections, "")

	switch deploymentType {
	case "embedded":
		sections = append(sections, locale.MonitoringNoopTraceEmbeddedHelp)
	case "external":
		sections = append(sections, locale.MonitoringNoopTraceExternalHelp)
	case "disabled":
		sections = append(sections, locale.MonitoringNoopTraceDisabledHelp)
	}

	return strings.Join(sections, "\n")
}

func (m *NoopTraceFormModel) HandleSave() error {
	config := m.GetController().GetNoopTraceConfig()
	deploymentType := m.getSelectedDeploymentType()
	fields := m.GetFormFields()

	// create a working copy of the current config to modify
	newConfig := &controller.NoopTraceConfig{
		DeploymentType: deploymentType,
		// copy current EnvVar fields - they preserve metadata like Line, IsPresent, etc.
		ListenIP:      config.ListenIP,
		ListenPort:    config.ListenPort,
		BaseURL:       config.BaseURL,
		ProjectID:     config.ProjectID,
		PublicKey:     config.PublicKey,
		SecretKey:     config.SecretKey,
		AdminEmail:    config.AdminEmail,
		AdminPassword: config.AdminPassword,
		AdminName:     config.AdminName,
		Installed:     config.Installed,
		LicenseKey:    config.LicenseKey,
	}

	// update field values based on form input
	for _, field := range fields {
		value := strings.TrimSpace(field.Input.Value())

		switch field.Key {
		case "listen_ip":
			newConfig.ListenIP.Value = value
		case "listen_port":
			newConfig.ListenPort.Value = value
		case "base_url":
			newConfig.BaseURL.Value = value
		case "project_id":
			newConfig.ProjectID.Value = value
		case "public_key":
			newConfig.PublicKey.Value = value
		case "secret_key":
			newConfig.SecretKey.Value = value
		case "admin_email":
			newConfig.AdminEmail.Value = value
		case "admin_password":
			newConfig.AdminPassword.Value = value
		case "admin_name":
			newConfig.AdminName.Value = value
		case "license_key":
			newConfig.LicenseKey.Value = value
		}
	}

	// save the configuration
	if err := m.GetController().UpdateNoopTraceConfig(newConfig); err != nil {
		logger.Errorf("[NoopTraceFormModel] SAVE: error updating nooptrace config: %v", err)
		return err
	}

	logger.Log("[NoopTraceFormModel] SAVE: success")
	return nil
}

func (m *NoopTraceFormModel) HandleReset() {
	// reset config to defaults
	config := m.GetController().ResetNoopTraceConfig()

	// reset deployment selection
	m.GetListHelper().SelectByValue(&m.deploymentList, config.DeploymentType)

	// rebuild form with reset deployment type
	m.BuildForm()
}

func (m *NoopTraceFormModel) OnFieldChanged(fieldIndex int, oldValue, newValue string) {
	// additional validation could be added here if needed
}

func (m *NoopTraceFormModel) GetFormFields() []FormField {
	return m.BaseScreen.fields
}

func (m *NoopTraceFormModel) SetFormFields(fields []FormField) {
	m.BaseScreen.fields = fields
}

// BaseListHandler interface implementation

func (m *NoopTraceFormModel) GetList() *list.Model {
	return &m.deploymentList
}

func (m *NoopTraceFormModel) GetListDelegate() *BaseListDelegate {
	return m.deploymentDelegate
}

func (m *NoopTraceFormModel) OnListSelectionChanged(oldSelection, newSelection string) {
	// rebuild form when deployment type changes
	m.BuildForm()
}

func (m *NoopTraceFormModel) GetListTitle() string {
	return locale.MonitoringNoopTraceDeploymentType
}

func (m *NoopTraceFormModel) GetListDescription() string {
	return locale.MonitoringNoopTraceDeploymentTypeDesc
}

// Update method - handle screen-specific input
func (m *NoopTraceFormModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		// handle list input first (if focused on list)
		if cmd := m.HandleListInput(msg); cmd != nil {
			return m, cmd
		}

		// then handle field input
		if cmd := m.HandleFieldInput(msg); cmd != nil {
			return m, cmd
		}
	}

	// delegate to base screen for common handling
	cmd := m.BaseScreen.Update(msg)
	return m, cmd
}

// Compile-time interface validation
var _ BaseScreenModel = (*NoopTraceFormModel)(nil)
var _ BaseScreenHandler = (*NoopTraceFormModel)(nil)
var _ BaseListHandler = (*NoopTraceFormModel)(nil)
