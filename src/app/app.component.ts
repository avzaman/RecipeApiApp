import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div id="header">
      <h1>Amir Zaman's</h1>
      <h2>Recipe Explorer</h2>
      <button id="refresh-button" (click)="refreshPage()">Back To Countries</button>
    </div>
    <div id="meal-container"></div>
  `,
  styles: [`
    #header {
      text-align: center;
      margin-bottom: 20px;
    }

    #refresh-button {
      background-color: #2ecc71;
      color: #fff;
      padding: 10px 20px;
      margin-top: 10px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease-in-out, transform 0.3s ease-in-out;
    }

     #refresh-button:hover {
      background-color: #27ae60;
      transform: scale(1.05);
    }

    #meal-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      padding: 20px;
      font-family: 'Arial, sans-serif';
      background: #f7f9fc;
      color: #333;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      max-width: 900px;
      margin: 0 auto;
      transition: all 0.3s ease-in-out;
    }

    button {
      background-color: #3498db;
      color: #fff;
      padding: 10px 20px;
      margin: 5px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease-in-out, transform 0.3s ease-in-out;
      flex-basis: calc(20% - 10px);
      text-align: center;
    }

    button:hover {
      background-color: #2980b9;
      transform: scale(1.05);
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    ul {
      list-style: none;
      padding: 0;
    }

    li {
      background: #ecf0f1;
      margin: 5px 0;
      padding: 10px;
      border-radius: 5px;
    }
  `]
})
export class AppComponent implements OnInit {
  meal: any = null;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    this.fetchAreas();
  }

  fetchAreas() {
    fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list')
      .then(response => response.json())
      .then(data => {
        this.renderAreaButtons(data.meals);
      })
      .catch(error => console.error('Error fetching areas:', error));
  }

  renderAreaButtons(areas: any[]) {
    const mealContainer = this.el.nativeElement.querySelector('#meal-container');
    mealContainer.innerHTML = ''; // Clear existing content

    areas.forEach(area => {
      const button = this.renderer.createElement('button');
      const buttonText = this.renderer.createText(area.strArea);

      this.renderer.appendChild(button, buttonText);
      this.renderer.listen(button, 'click', () => this.fetchMealsByArea(area.strArea));
      this.renderer.appendChild(mealContainer, button);
    });
  }

  fetchMealsByArea(area: string) {
    fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`)
      .then(response => response.json())
      .then(data => {
        this.renderMealButtons(data.meals);
      })
      .catch(error => console.error('Error fetching meals:', error));
  }

  renderMealButtons(meals: any[]) {
    const mealContainer = this.el.nativeElement.querySelector('#meal-container');
    mealContainer.innerHTML = ''; // Clear existing content

    meals.forEach(meal => {
      const button = this.renderer.createElement('button');
      const buttonText = this.renderer.createText(meal.strMeal);

      this.renderer.appendChild(button, buttonText);
      this.renderer.listen(button, 'click', () => this.fetchMealDetails(meal.idMeal));
      this.renderer.appendChild(mealContainer, button);
    });
  }

  fetchMealDetails(mealId: string) {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
      .then(response => response.json())
      .then(data => {
        this.meal = data.meals[0];
        this.renderMeal();
      })
      .catch(error => console.error('Error fetching meal details:', error));
  }

  renderMeal() {
    if (this.meal) {
      const mealContainer = this.el.nativeElement.querySelector('#meal-container');

      const mealHtml = `
        <h1>${this.meal.strMeal}</h1>
        <img src="${this.meal.strMealThumb}" alt="${this.meal.strMeal}">
        <p><strong>Category:</strong> ${this.meal.strCategory}</p>
        <p><strong>Area:</strong> ${this.meal.strArea}</p>
        <p><strong>Instructions:</strong> ${this.meal.strInstructions}</p>
        <ul>
          ${this.getIngredients().map(ingredient => `<li>${ingredient}</li>`).join('')}
        </ul>
      `;

      this.renderer.setProperty(mealContainer, 'innerHTML', mealHtml);
    }
  }

  getIngredients() {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      if (this.meal[`strIngredient${i}`] && this.meal[`strIngredient${i}`].trim() !== '') {
        ingredients.push(`${this.meal[`strMeasure${i}`]} ${this.meal[`strIngredient${i}`]}`);
      }
    }
    return ingredients;
  }

  refreshPage() {
    window.location.reload();
  }
}
