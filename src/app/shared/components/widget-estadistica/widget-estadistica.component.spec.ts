import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WidgetEstadisticaComponent } from './widget-estadistica.component';

describe('WidgetEstadisticaComponent', () => {
  let fixture: ComponentFixture<WidgetEstadisticaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [WidgetEstadisticaComponent] }).compileComponents();
    fixture = TestBed.createComponent(WidgetEstadisticaComponent);
    fixture.componentRef.setInput('titulo', 'Stock bajo');
    fixture.componentRef.setInput('valor', 4);
    fixture.detectChanges();
  });

  it('muestra el título y el valor recibidos por input', () => {
    const texto = fixture.nativeElement.textContent;
    expect(texto).toContain('Stock bajo');
    expect(texto).toContain('4');
  });

  it('emite el evento pulsado con su título al hacer clic', () => {
    const emitidos: string[] = [];
    fixture.componentInstance.pulsado.subscribe((t) => emitidos.push(t));
    fixture.nativeElement.querySelector('button').click();
    expect(emitidos).toEqual(['Stock bajo']);
  });
});
