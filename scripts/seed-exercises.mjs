import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL não está definida");
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// Grupos musculares
const muscleGroupsData = [
  { name: "Peito" },
  { name: "Costas" },
  { name: "Ombros" },
  { name: "Bíceps" },
  { name: "Tríceps" },
  { name: "Pernas" },
  { name: "Abdômen" },
  { name: "Glúteos" },
];

// Exercícios padrão
const exercisesData = [
  // Peito
  { name: "Supino Reto", muscleGroupId: 1, equipmentType: "barbell", isCustom: 0 },
  { name: "Supino Inclinado", muscleGroupId: 1, equipmentType: "barbell", isCustom: 0 },
  { name: "Supino Declinado", muscleGroupId: 1, equipmentType: "barbell", isCustom: 0 },
  { name: "Supino com Halteres", muscleGroupId: 1, equipmentType: "dumbbell", isCustom: 0 },
  { name: "Crucifixo", muscleGroupId: 1, equipmentType: "dumbbell", isCustom: 0 },
  { name: "Crossover", muscleGroupId: 1, equipmentType: "cable", isCustom: 0 },
  { name: "Flexão de Braço", muscleGroupId: 1, equipmentType: "bodyweight", isCustom: 0 },
  
  // Costas
  { name: "Barra Fixa", muscleGroupId: 2, equipmentType: "bodyweight", isCustom: 0 },
  { name: "Remada Curvada", muscleGroupId: 2, equipmentType: "barbell", isCustom: 0 },
  { name: "Remada Cavalinho", muscleGroupId: 2, equipmentType: "machine", isCustom: 0 },
  { name: "Puxada Frontal", muscleGroupId: 2, equipmentType: "cable", isCustom: 0 },
  { name: "Remada Unilateral", muscleGroupId: 2, equipmentType: "dumbbell", isCustom: 0 },
  { name: "Levantamento Terra", muscleGroupId: 2, equipmentType: "barbell", isCustom: 0 },
  
  // Ombros
  { name: "Desenvolvimento com Barra", muscleGroupId: 3, equipmentType: "barbell", isCustom: 0 },
  { name: "Desenvolvimento com Halteres", muscleGroupId: 3, equipmentType: "dumbbell", isCustom: 0 },
  { name: "Elevação Lateral", muscleGroupId: 3, equipmentType: "dumbbell", isCustom: 0 },
  { name: "Elevação Frontal", muscleGroupId: 3, equipmentType: "dumbbell", isCustom: 0 },
  { name: "Remada Alta", muscleGroupId: 3, equipmentType: "barbell", isCustom: 0 },
  
  // Bíceps
  { name: "Rosca Direta", muscleGroupId: 4, equipmentType: "barbell", isCustom: 0 },
  { name: "Rosca Alternada", muscleGroupId: 4, equipmentType: "dumbbell", isCustom: 0 },
  { name: "Rosca Martelo", muscleGroupId: 4, equipmentType: "dumbbell", isCustom: 0 },
  { name: "Rosca Scott", muscleGroupId: 4, equipmentType: "barbell", isCustom: 0 },
  { name: "Rosca Concentrada", muscleGroupId: 4, equipmentType: "dumbbell", isCustom: 0 },
  
  // Tríceps
  { name: "Tríceps Testa", muscleGroupId: 5, equipmentType: "barbell", isCustom: 0 },
  { name: "Tríceps Francês", muscleGroupId: 5, equipmentType: "dumbbell", isCustom: 0 },
  { name: "Tríceps Corda", muscleGroupId: 5, equipmentType: "cable", isCustom: 0 },
  { name: "Mergulho", muscleGroupId: 5, equipmentType: "bodyweight", isCustom: 0 },
  
  // Pernas
  { name: "Agachamento Livre", muscleGroupId: 6, equipmentType: "barbell", isCustom: 0 },
  { name: "Leg Press", muscleGroupId: 6, equipmentType: "machine", isCustom: 0 },
  { name: "Cadeira Extensora", muscleGroupId: 6, equipmentType: "machine", isCustom: 0 },
  { name: "Mesa Flexora", muscleGroupId: 6, equipmentType: "machine", isCustom: 0 },
  { name: "Stiff", muscleGroupId: 6, equipmentType: "barbell", isCustom: 0 },
  { name: "Afundo", muscleGroupId: 6, equipmentType: "dumbbell", isCustom: 0 },
  { name: "Panturrilha em Pé", muscleGroupId: 6, equipmentType: "machine", isCustom: 0 },
  
  // Glúteos
  { name: "Elevação Pélvica", muscleGroupId: 8, equipmentType: "barbell", isCustom: 0 },
  { name: "Cadeira Abdutora", muscleGroupId: 8, equipmentType: "machine", isCustom: 0 },
  
  // Abdômen
  { name: "Abdominal Supra", muscleGroupId: 7, equipmentType: "bodyweight", isCustom: 0 },
  { name: "Abdominal Infra", muscleGroupId: 7, equipmentType: "bodyweight", isCustom: 0 },
  { name: "Prancha", muscleGroupId: 7, equipmentType: "bodyweight", isCustom: 0 },
];

async function seed() {
  try {
    console.log("Iniciando seed do banco de dados...");

    const connection = await mysql.createConnection(DATABASE_URL);
    
    // Inserir grupos musculares
    console.log("Inserindo grupos musculares...");
    for (const group of muscleGroupsData) {
      await connection.execute(
        "INSERT INTO muscle_groups (name) VALUES (?) ON DUPLICATE KEY UPDATE name = name",
        [group.name]
      );
    }
    
    // Obter ID do primeiro usuário (owner) ou criar um padrão
    const [users] = await connection.execute("SELECT id FROM users LIMIT 1");
    let userId;
    
    if (users.length === 0) {
      console.log("Criando usuário padrão para exercícios...");
      const [result] = await connection.execute(
        `INSERT INTO users (openId, name, email, role) VALUES (?, ?, ?, ?)`,
        ['system-default', 'Sistema', 'system@ironlog.app', 'admin']
      );
      userId = result.insertId;
    } else {
      userId = users[0].id;
    }
    
    // Inserir exercícios
    console.log("Inserindo exercícios...");
    for (const exercise of exercisesData) {
      await connection.execute(
        `INSERT INTO exercises (userId, name, muscleGroupId, equipmentType, isCustom) 
         VALUES (?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE name = name`,
        [userId, exercise.name, exercise.muscleGroupId, exercise.equipmentType, exercise.isCustom]
      );
    }
    
    await connection.end();
    
    console.log("✅ Seed concluído com sucesso!");
    console.log(`- ${muscleGroupsData.length} grupos musculares`);
    console.log(`- ${exercisesData.length} exercícios`);
    
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  }
}

seed();
