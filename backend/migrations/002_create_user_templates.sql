-- Add reusable user templates and version history.

CREATE TABLE IF NOT EXISTS user_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL,
    name TEXT NOT NULL DEFAULT 'Untitled template',
    template_id TEXT NOT NULL,
    schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version > 0),
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    document JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_template_id UUID NOT NULL REFERENCES user_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    version INTEGER NOT NULL CHECK (version > 0),
    schema_version INTEGER NOT NULL DEFAULT 1 CHECK (schema_version > 0),
    document JSONB NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_template_id, version)
);

ALTER TABLE portfolios
    ADD COLUMN IF NOT EXISTS user_template_id UUID REFERENCES user_templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_templates_user_id ON user_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_templates_portfolio_id ON user_templates(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_user_template_versions_template_id ON user_template_versions(user_template_id, version DESC);

ALTER TABLE user_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_template_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own user templates"
    ON user_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own user templates"
    ON user_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own user templates"
    ON user_templates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own user templates"
    ON user_templates FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own template versions"
    ON user_template_versions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own template versions"
    ON user_template_versions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own template versions"
    ON user_template_versions FOR DELETE
    USING (auth.uid() = user_id);

CREATE TRIGGER update_user_templates_updated_at
    BEFORE UPDATE ON user_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
