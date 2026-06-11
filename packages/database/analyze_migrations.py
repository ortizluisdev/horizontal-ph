#!/usr/bin/env python3
"""
Script para visualizar información sobre las migraciones de la base de datos
Horizontal PH - Sistema de Gestión de Conjuntos Residenciales
"""

import os
import re
from pathlib import Path
from dataclasses import dataclass
from typing import List

@dataclass
class MigrationInfo:
    number: int
    filename: str
    title: str
    tables: int
    indexes: int
    comments: int

class MigrationAnalyzer:
    def __init__(self, migrations_dir):
        self.migrations_dir = Path(migrations_dir)
        self.migrations: List[MigrationInfo] = []
    
    def analyze(self):
        """Analiza todos los archivos de migración"""
        for sql_file in sorted(self.migrations_dir.glob("*.sql")):
            info = self._parse_migration_file(sql_file)
            if info:
                self.migrations.append(info)
    
    def _parse_migration_file(self, file_path: Path) -> MigrationInfo:
        """Extrae información de un archivo de migración"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extraer número y título
        match = re.match(r'(\d+)_(.+)\.sql', file_path.name)
        if not match:
            return None
        
        number = int(match.group(1))
        filename = file_path.name
        
        # Extraer título del comentario
        title_match = re.search(r'-- \d+_(.+?)\.sql\s*\n-- (.+?)(?:\n|$)', content)
        title = title_match.group(2) if title_match else "Sin descripción"
        
        # Contar tablas
        tables = len(re.findall(r'CREATE TABLE IF NOT EXISTS', content))
        
        # Contar índices
        indexes = len(re.findall(r'CREATE INDEX', content))
        
        # Contar comentarios
        comments = len(re.findall(r'COMMENT ON', content))
        
        return MigrationInfo(number, filename, title, tables, indexes, comments)
    
    def print_summary(self):
        """Imprime un resumen de todas las migraciones"""
        print("=" * 100)
        print("MIGRACIONES DE BASE DE DATOS - HORIZONTAL PH")
        print("=" * 100)
        print()
        
        total_tables = 0
        total_indexes = 0
        total_comments = 0
        
        print(f"{'#':<3} {'Archivo':<40} {'Descripción':<35} {'Tablas':<8} {'Índices':<8} {'Docs':<6}")
        print("-" * 100)
        
        for mig in self.migrations:
            print(f"{mig.number:<3} {mig.filename:<40} {mig.title:<35} {mig.tables:<8} {mig.indexes:<8} {mig.comments:<6}")
            total_tables += mig.tables
            total_indexes += mig.indexes
            total_comments += mig.comments
        
        print("-" * 100)
        print(f"{'TOTAL':<44} {'':<35} {total_tables:<8} {total_indexes:<8} {total_comments:<6}")
        print("=" * 100)
        print()
        print(f"✅ Total de migraciones: {len(self.migrations)}")
        print(f"✅ Total de tablas: {total_tables}+")
        print(f"✅ Total de índices: {total_indexes}+")
        print(f"✅ Documentación: {total_comments} comentarios SQL")
        print()
    
    def print_detailed_report(self):
        """Imprime un reporte detallado"""
        self.print_summary()
        
        print("\nDETALLE DE MIGRACIONES POR CATEGORÍA:")
        print("-" * 50)
        
        categories = {
            "Infraestructura Base": [1, 2, 3, 4, 5],
            "Operativa": [6, 7, 8],
            "Autenticación": [9, 10],
            "Dominio": [11, 12, 13, 14]
        }
        
        for category, numbers in categories.items():
            print(f"\n📁 {category}:")
            category_migrations = [m for m in self.migrations if m.number in numbers]
            for mig in category_migrations:
                print(f"   [{mig.number:02d}] {mig.filename:<40} - {mig.title}")

if __name__ == "__main__":
    # Determinar la ruta del directorio de migraciones
    script_dir = Path(__file__).parent
    migrations_dir = script_dir / "migrations"
    
    if not migrations_dir.exists():
        print(f"❌ Directorio no encontrado: {migrations_dir}")
        exit(1)
    
    # Analizar y mostrar
    analyzer = MigrationAnalyzer(migrations_dir)
    analyzer.analyze()
    analyzer.print_detailed_report()
