package hardening

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/url"

	"pentagi/cmd/installer/checker"
	"pentagi/cmd/installer/loader"
	"pentagi/cmd/installer/state"

	"github.com/google/uuid"
	"github.com/vxcontrol/cloud/sdk"
	"github.com/vxcontrol/cloud/system"
)

type HardeningArea string

const (
	HardeningAreaPentagi  HardeningArea = "pentagi"
	HardeningAreaNoopTrace HardeningArea = "nooptrace"
	HardeningAreaGraphiti HardeningArea = "graphiti"
)

type HardeningPolicyType string

const (
	HardeningPolicyTypeDefault   HardeningPolicyType = "default"
	HardeningPolicyTypeHex       HardeningPolicyType = "hex"
	HardeningPolicyTypeUUID      HardeningPolicyType = "uuid"
	HardeningPolicyTypeBoolTrue  HardeningPolicyType = "bool_true"
	HardeningPolicyTypeBoolFalse HardeningPolicyType = "bool_false"
)

type HardeningPolicy struct {
	Type   HardeningPolicyType
	Length int    // length of the random string
	Prefix string // prefix for the random string
}

var varsForHardening = map[HardeningArea][]string{
	HardeningAreaPentagi: {
		"COOKIE_SIGNING_SALT",
		"PENTAGI_POSTGRES_PASSWORD",
		"LOCAL_SCRAPER_USERNAME",
		"LOCAL_SCRAPER_PASSWORD",
		"SCRAPER_PRIVATE_URL",
	},
	HardeningAreaGraphiti: {
		"NEO4J_PASSWORD",
	},
	HardeningAreaNoopTrace: {
		"NOOPTRACE_POSTGRES_PASSWORD",
		"NOOPTRACE_CLICKHOUSE_PASSWORD",
		"NOOPTRACE_S3_ACCESS_KEY_ID",
		"NOOPTRACE_S3_SECRET_ACCESS_KEY",
		"NOOPTRACE_REDIS_AUTH",
		"NOOPTRACE_SALT",
		"NOOPTRACE_ENCRYPTION_KEY",
		"NOOPTRACE_NEXTAUTH_SECRET",
		"NOOPTRACE_INIT_PROJECT_ID",
		"NOOPTRACE_INIT_PROJECT_PUBLIC_KEY",
		"NOOPTRACE_INIT_PROJECT_SECRET_KEY",
		"NOOPTRACE_AUTH_DISABLE_SIGNUP",
		"NOOPTRACE_PROJECT_ID",
		"NOOPTRACE_PUBLIC_KEY",
		"NOOPTRACE_SECRET_KEY",
	},
}

var varsForHardeningDefault = map[string]string{
	"COOKIE_SIGNING_SALT":              "salt",
	"PENTAGI_POSTGRES_PASSWORD":        "postgres",
	"NEO4J_PASSWORD":                   "devpassword",
	"LOCAL_SCRAPER_USERNAME":           "someuser",
	"LOCAL_SCRAPER_PASSWORD":           "somepass",
	"SCRAPER_PRIVATE_URL":              "https://someuser:somepass@scraper/",
	"NOOPTRACE_POSTGRES_PASSWORD":       "postgres",
	"NOOPTRACE_CLICKHOUSE_PASSWORD":     "clickhouse",
	"NOOPTRACE_S3_ACCESS_KEY_ID":        "accesskey",
	"NOOPTRACE_S3_SECRET_ACCESS_KEY":    "secretkey",
	"NOOPTRACE_REDIS_AUTH":              "redispassword",
	"NOOPTRACE_SALT":                    "salt",
	"NOOPTRACE_ENCRYPTION_KEY":          "0000000000000000000000000000000000000000000000000000000000000000",
	"NOOPTRACE_NEXTAUTH_SECRET":         "secret",
	"NOOPTRACE_INIT_PROJECT_ID":         "cm47619l0000872mcd2dlbqwb",
	"NOOPTRACE_INIT_PROJECT_PUBLIC_KEY": "pk-lf-00000000-0000-0000-0000-000000000000",
	"NOOPTRACE_INIT_PROJECT_SECRET_KEY": "sk-lf-00000000-0000-0000-0000-000000000000",
	"NOOPTRACE_AUTH_DISABLE_SIGNUP":     "false",
	"NOOPTRACE_PROJECT_ID":              "",
	"NOOPTRACE_PUBLIC_KEY":              "",
	"NOOPTRACE_SECRET_KEY":              "",
}

var varsHardeningSyncNoopTrace = map[string]string{
	"NOOPTRACE_PROJECT_ID": "NOOPTRACE_INIT_PROJECT_ID",
	"NOOPTRACE_PUBLIC_KEY": "NOOPTRACE_INIT_PROJECT_PUBLIC_KEY",
	"NOOPTRACE_SECRET_KEY": "NOOPTRACE_INIT_PROJECT_SECRET_KEY",
}

var varsHardeningPolicies = map[HardeningArea]map[string]HardeningPolicy{
	HardeningAreaPentagi: {
		"COOKIE_SIGNING_SALT":       {Type: HardeningPolicyTypeHex, Length: 32},
		"PENTAGI_POSTGRES_PASSWORD": {Type: HardeningPolicyTypeDefault, Length: 18},
		"LOCAL_SCRAPER_USERNAME":    {Type: HardeningPolicyTypeDefault, Length: 10},
		"LOCAL_SCRAPER_PASSWORD":    {Type: HardeningPolicyTypeDefault, Length: 12},
		// SCRAPER_PRIVATE_URL is handled specially in DoHardening logic
	},
	HardeningAreaGraphiti: {
		"NEO4J_PASSWORD": {Type: HardeningPolicyTypeDefault, Length: 18},
	},
	HardeningAreaNoopTrace: {
		"NOOPTRACE_POSTGRES_PASSWORD":       {Type: HardeningPolicyTypeDefault, Length: 18},
		"NOOPTRACE_CLICKHOUSE_PASSWORD":     {Type: HardeningPolicyTypeDefault, Length: 18},
		"NOOPTRACE_S3_ACCESS_KEY_ID":        {Type: HardeningPolicyTypeDefault, Length: 20},
		"NOOPTRACE_S3_SECRET_ACCESS_KEY":    {Type: HardeningPolicyTypeDefault, Length: 40},
		"NOOPTRACE_REDIS_AUTH":              {Type: HardeningPolicyTypeHex, Length: 48},
		"NOOPTRACE_SALT":                    {Type: HardeningPolicyTypeHex, Length: 28},
		"NOOPTRACE_ENCRYPTION_KEY":          {Type: HardeningPolicyTypeHex, Length: 64},
		"NOOPTRACE_NEXTAUTH_SECRET":         {Type: HardeningPolicyTypeHex, Length: 32},
		"NOOPTRACE_INIT_PROJECT_PUBLIC_KEY": {Type: HardeningPolicyTypeUUID, Prefix: "pk-lf-"},
		"NOOPTRACE_INIT_PROJECT_SECRET_KEY": {Type: HardeningPolicyTypeUUID, Prefix: "sk-lf-"},
		"NOOPTRACE_AUTH_DISABLE_SIGNUP":     {Type: HardeningPolicyTypeBoolTrue},
		// NOOPTRACE_PROJECT_ID, NOOPTRACE_PUBLIC_KEY, NOOPTRACE_SECRET_KEY are handled specially in syncNoopTraceState
		// NOOPTRACE_INIT_USER_PASSWORD changes in web UI after first login, so we don't need to harden it
	},
}

func DoHardening(s state.State, c checker.CheckResult) error {
	var haveToCommit bool

	installationID := system.GetInstallationID().String()
	if id, _ := s.GetVar("INSTALLATION_ID"); id.Value != installationID {
		if err := s.SetVar("INSTALLATION_ID", installationID); err != nil {
			return fmt.Errorf("failed to set INSTALLATION_ID: %w", err)
		}
		haveToCommit = true
	}

	if licenseKey, exists := s.GetVar("LICENSE_KEY"); exists && licenseKey.Value != "" {
		if info, err := sdk.IntrospectLicenseKey(licenseKey.Value); err != nil {
			return fmt.Errorf("failed to introspect license key: %w", err)
		} else if !info.IsValid() {
			if err := s.SetVar("LICENSE_KEY", ""); err != nil {
				return fmt.Errorf("failed to set LICENSE_KEY: %w", err)
			}
			haveToCommit = true
		}
	}

	// harden nooptrace vars only if neither containers nor volumes exist
	// this prevents password changes when volumes with existing credentials are present
	if vars, _ := s.GetVars(varsForHardening[HardeningAreaNoopTrace]); !c.NoopTraceInstalled && !c.NoopTraceVolumesExist {
		updateDefaultValues(vars)

		if isChanged, err := replaceDefaultValues(s, vars, varsHardeningPolicies[HardeningAreaNoopTrace]); err != nil {
			return fmt.Errorf("failed to replace default values for nooptrace: %w", err)
		} else if isChanged {
			haveToCommit = true
		}

		if isChanged, err := syncNoopTraceState(s, vars); err != nil {
			return fmt.Errorf("failed to sync nooptrace vars: %w", err)
		} else if isChanged {
			haveToCommit = true
		}
	}

	// harden graphiti vars only if neither containers nor volumes exist
	// this prevents password changes when volumes with existing credentials are present
	if vars, _ := s.GetVars(varsForHardening[HardeningAreaGraphiti]); !c.GraphitiInstalled && !c.GraphitiVolumesExist {
		updateDefaultValues(vars)

		if isChanged, err := replaceDefaultValues(s, vars, varsHardeningPolicies[HardeningAreaGraphiti]); err != nil {
			return fmt.Errorf("failed to replace default values for graphiti: %w", err)
		} else if isChanged {
			haveToCommit = true
		}
	}

	// harden pentagi vars only if neither containers nor volumes exist
	// this prevents password changes when volumes with existing credentials are present
	if vars, _ := s.GetVars(varsForHardening[HardeningAreaPentagi]); !c.PentagiInstalled && !c.PentagiVolumesExist {
		updateDefaultValues(vars)

		if isChanged, err := replaceDefaultValues(s, vars, varsHardeningPolicies[HardeningAreaPentagi]); err != nil {
			return fmt.Errorf("failed to replace default values for pentagi: %w", err)
		} else if isChanged {
			haveToCommit = true
		}

		// sync scraper local URL access
		if isChanged, err := syncScraperState(s, vars); err != nil {
			return fmt.Errorf("failed to sync scraper state: %w", err)
		} else if isChanged {
			haveToCommit = true
		}
	}

	if haveToCommit {
		if err := s.Commit(); err != nil {
			return fmt.Errorf("failed to commit vars: %w", err)
		}
	}

	return nil
}

func syncValueToState(s state.State, curVar loader.EnvVar, newValue string) (loader.EnvVar, error) {
	if err := s.SetVar(curVar.Name, newValue); err != nil {
		return curVar, fmt.Errorf("failed to set var %s: %w", curVar.Name, err)
	}

	// get actual value from state and restore default value from previous step
	newEnvVar, _ := s.GetVar(curVar.Name)
	newEnvVar.Default = curVar.Value

	return newEnvVar, nil
}

func syncScraperState(s state.State, vars map[string]loader.EnvVar) (bool, error) {
	var isChanged bool

	varName := "SCRAPER_PRIVATE_URL"
	scraperPrivateURL, urlExists := vars[varName]
	isDefaultScraperURL := urlExists && scraperPrivateURL.IsDefault()

	scraperLocalUser, userExists := vars["LOCAL_SCRAPER_USERNAME"]
	scraperLocalPassword, passwordExists := vars["LOCAL_SCRAPER_PASSWORD"]
	isCredentialsExists := userExists && passwordExists
	isCredentialsChanged := scraperLocalUser.IsChanged || scraperLocalPassword.IsChanged

	if isDefaultScraperURL && isCredentialsExists && isCredentialsChanged {
		parsedScraperPrivateURL, err := url.Parse(scraperPrivateURL.Value)
		if err != nil {
			return isChanged, fmt.Errorf("failed to parse scraper private URL: %w", err)
		}

		parsedScraperPrivateURL.User = url.UserPassword(scraperLocalUser.Value, scraperLocalPassword.Value)
		syncedScraperPrivateURL, err := syncValueToState(s, scraperPrivateURL, parsedScraperPrivateURL.String())
		if err != nil {
			return isChanged, fmt.Errorf("failed to sync scraper private URL: %w", err)
		}
		vars[varName] = syncedScraperPrivateURL
		if syncedScraperPrivateURL.IsChanged {
			isChanged = true
		}
	}

	return isChanged, nil
}

func syncNoopTraceState(s state.State, vars map[string]loader.EnvVar) (bool, error) {
	var isChanged bool

	for varName, syncVarName := range varsHardeningSyncNoopTrace {
		envVar, exists := vars[varName]
		if !exists {
			continue
		}

		// don't change user values
		if envVar.Value != "" {
			continue
		}

		if syncVar, syncVarExists := vars[syncVarName]; syncVarExists {
			syncedEnvVar, err := syncValueToState(s, envVar, syncVar.Value)
			if err != nil {
				return isChanged, fmt.Errorf("failed to sync var %s: %w", varName, err)
			}
			vars[varName] = syncedEnvVar
			if syncedEnvVar.IsChanged {
				isChanged = true
			}
		}
	}

	return isChanged, nil
}

func replaceDefaultValues(
	s state.State, vars map[string]loader.EnvVar, policies map[string]HardeningPolicy,
) (bool, error) {
	var (
		err       error
		isChanged bool
	)

	for varName, envVar := range vars {
		if policy, ok := policies[varName]; ok && envVar.IsDefault() {
			envVar.Value, err = randomString(policy)
			if err != nil {
				return isChanged, fmt.Errorf("failed to generate random string for %s: %w", varName, err)
			}
			syncedEnvVar, err := syncValueToState(s, envVar, envVar.Value)
			if err != nil {
				return isChanged, fmt.Errorf("failed to sync var %s: %w", varName, err)
			}
			vars[varName] = syncedEnvVar
			if syncedEnvVar.IsChanged {
				isChanged = true
			}
		}
	}

	return isChanged, nil
}

func updateDefaultValues(vars map[string]loader.EnvVar) {
	for varName, envVar := range vars {
		if defVal, ok := varsForHardeningDefault[varName]; ok && envVar.Default == "" {
			envVar.Default = defVal
			vars[varName] = envVar
		}
	}
}

func randomString(policy HardeningPolicy) (string, error) {
	switch policy.Type {
	case HardeningPolicyTypeDefault:
		return randStringAlpha(policy.Length)
	case HardeningPolicyTypeHex:
		return randStringHex(policy.Length)
	case HardeningPolicyTypeUUID:
		return randStringUUID(policy.Prefix)
	case HardeningPolicyTypeBoolTrue:
		return "true", nil
	case HardeningPolicyTypeBoolFalse:
		return "false", nil
	default:
		return "", fmt.Errorf("invalid hardening policy type: %s", policy.Type)
	}
}

func randStringAlpha(length int) (string, error) {
	bytes := make([]byte, length)
	_, err := rand.Reader.Read(bytes)
	if err != nil {
		return "", err
	}

	charset := "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	for i, b := range bytes {
		bytes[i] = charset[b%byte(len(charset))]
	}

	return string(bytes), nil
}

func randStringHex(length int) (string, error) {
	byteLength := length/2 + 1
	bytes := make([]byte, byteLength)
	_, err := rand.Reader.Read(bytes)
	if err != nil {
		return "", err
	}

	hexString := hex.EncodeToString(bytes)
	return hexString[:length], nil
}

func randStringUUID(prefix string) (string, error) {
	return prefix + uuid.New().String(), nil
}
