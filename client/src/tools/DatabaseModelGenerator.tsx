import { Layout } from "@/layout/Layout";
import { useState } from "react";
import { Copy, RefreshCw, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const databaseTypes = ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Prisma", "Drizzle ORM"];

function generateModel(name: string, fields: Array<{name: string, type: string, nullable: boolean}>, dbType: string): string {
  const modelName = name.charAt(0).toUpperCase() + name.slice(1);
  
  switch (dbType) {
    case "PostgreSQL":
      return generatePostgreSQL(name, fields);
    case "MySQL":
      return generateMySQL(name, fields);
    case "MongoDB":
      return generateMongoDB(name, fields);
    case "SQLite":
      return generateSQLite(name, fields);
    case "Prisma":
      return generatePrisma(name, fields);
    case "Drizzle ORM":
      return generateDrizzle(name, fields);
    default:
      return "";
  }
}

function generatePostgreSQL(name: string, fields: Array<{name: string, type: string, nullable: boolean}>): string {
  const columns = fields.map(f => {
    const nullable = f.nullable ? "" : " NOT NULL";
    return `  ${f.name} ${f.type}${nullable}`;
  }).join(",\n");
  
  return `CREATE TABLE ${name} (
  id SERIAL PRIMARY KEY,
${columns},
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;
}

function generateMySQL(name: string, fields: Array<{name: string, type: string, nullable: boolean}>): string {
  const columns = fields.map(f => {
    const nullable = f.nullable ? "" : " NOT NULL";
    return `  ${f.name} ${f.type}${nullable}`;
  }).join(",\n");
  
  return `CREATE TABLE ${name} (
  id INT AUTO_INCREMENT PRIMARY KEY,
${columns},
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
}

function generateMongoDB(name: string, fields: Array<{name: string, type: string, nullable: boolean}>): string {
  const schema = fields.map(f => `  ${f.name}: ${f.type}${f.nullable ? " | null" : ""}`).join(",\n");
  
  return `interface ${name.charAt(0).toUpperCase() + name.slice(1)} {
  _id?: ObjectId;
${schema};
  createdAt?: Date;
  updatedAt?: Date;
}`;
}

function generateSQLite(name: string, fields: Array<{name: string, type: string, nullable: boolean}>): string {
  const columns = fields.map(f => {
    const nullable = f.nullable ? "" : " NOT NULL";
    return `  ${f.name} ${f.type}${nullable}`;
  }).join(",\n");
  
  return `CREATE TABLE ${name} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
${columns},
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`;
}

function generatePrisma(name: string, fields: Array<{name: string, type: string, nullable: boolean}>): string {
  const modelName = name.charAt(0).toUpperCase() + name.slice(1);
  const prismaFields = fields.map(f => {
    const nullable = f.nullable ? "?" : "";
    return `  ${f.name} ${f.type}${nullable}`;
  }).join("\n");
  
  return `model ${modelName} {
  id        Int      @id @default(autoincrement())
${prismaFields}
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;
}

function generateDrizzle(name: string, fields: Array<{name: string, type: string, nullable: boolean}>): string {
  const modelName = name.charAt(0).toUpperCase() + name.slice(1);
  const drizzleFields = fields.map(f => {
    const nullable = f.nullable ? ".nullable()" : "";
    return `  ${f.name}: ${f.type}("${f.name}")${nullable},`;
  }).join("\n");
  
  return `import { pgTable, serial, timestamp } from "drizzle-orm/pg-core";

export const ${name} = pgTable("${name}", {
  id: serial("id").primaryKey(),
${drizzleFields}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});`;
}

export default function DatabaseModelGenerator() {
  const { toast } = useToast();
  const [dbType, setDbType] = useState("PostgreSQL");
  const [tableName, setTableName] = useState("");
  const [fieldsInput, setFieldsInput] = useState("");
  const [output, setOutput] = useState("");

  const parseFields = (input: string): Array<{name: string, type: string, nullable: boolean}> => {
    const lines = input.split("\n").filter(l => l.trim());
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const name = parts[0];
      const type = parts[1] || "VARCHAR(255)";
      const nullable = line.includes("?") || line.toLowerCase().includes("nullable");
      return { name, type, nullable };
    });
  };

  const generate = () => {
    if (!tableName) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un nombre de tabla.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fields = parseFields(fieldsInput);
      const model = generateModel(tableName, fields, dbType);
      setOutput(model);
      toast({
        title: "Modelo generado",
        description: `Modelo ${dbType} generado exitosamente.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copiado",
      description: "El modelo ha sido copiado al portapapeles.",
    });
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generador de Modelos de Base de Datos</h1>
            <p className="text-muted-foreground mt-1">Genera modelos para diferentes bases de datos.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generate}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generar
            </Button>
            {output && (
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 flex-1 min-h-0">
          {/* Configuración */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto space-y-4">
            <h2 className="font-semibold mb-4">Configuración</h2>
            
            <div className="space-y-2">
              <Label htmlFor="dbType">Tipo de Base de Datos</Label>
              <Select value={dbType} onValueChange={setDbType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {databaseTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tableName">Nombre de la Tabla/Modelo</Label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="users"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fields">Campos (uno por línea)</Label>
              <Textarea
                id="fields"
                value={fieldsInput}
                onChange={(e) => setFieldsInput(e.target.value)}
                rows={15}
                placeholder="name VARCHAR(255)&#10;email VARCHAR(255)&#10;age INTEGER&#10;active BOOLEAN"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Formato: nombre tipo [nullable]<br />
                Ejemplo: email VARCHAR(255) nullable
              </p>
            </div>
          </div>

          {/* Output */}
          <div className="bg-card border border-border rounded-xl p-6 overflow-y-auto">
            <h2 className="font-semibold mb-4">Modelo Generado</h2>
            {output ? (
              <div className="bg-[#1E1E1E] rounded-md p-4 font-mono text-sm text-green-400 whitespace-pre-wrap overflow-x-auto">
                {output}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configura y genera el modelo</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

